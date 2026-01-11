import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import Parse from 'html-react-parser';
import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useStudy } from 'rssa-api';
import { useStepCompletion } from 'rssa-study-template';
import type {
    EssayResponse,
    EssayResponseObject,
    ParticipantResponsePayload,
} from '../../types/preferenceVisualization.types';
import type { StudyLayoutContextType } from '../../types/study.types';

interface MutationResult {
    type: 'POST' | 'PATCH';
    id: string;
    familiarity: string;
    exploration: string;
    explanation: string;
    version: number;
}

const PROMPTS = {
    familiarity: '<p>Which of the movies on the visualization are you unfamiliar with?</p>',
    exploration: `<p>Which of the movies in the visualization may help you:
				<ol type="a" style="margin: 0.5rem">
					<li style="margin: 0 1em 1em 1em;">
						explore a new interest (e.g. an unfamiliar genre, or pick up a new hobby)?
					</li>
					<li style="margin: 0 1em 1em 1em;">
						widen an existing interest (e.g. an unfamiliar direction within a familiar genre)?
					</li>
					<li style="margin: 0 1em 0.5em 1em;">
						deepen an existing interest (e.g. a specialization of a familiar genre)?
					</li>
				</ol>
			</p>`,
    explanation: `<p style="font-weight: 500">
			Use your answers above to explain the concrete steps you would take to expand your movie preferences.
		</p>`,
};

const ParticipantResponsePanel = ({
    participantResponse,
    condition,
}: {
    participantResponse: EssayResponse | undefined;
    condition: { id: string; name: string };
}) => {
    const [localResponseDraft, setLocalResponseDraft] = useState<EssayResponseObject>({
        familiarity: '',
        exploration: '',
        explanation: '',
    });

    // State for the expanded modal
    const [expandedField, setExpandedField] = useState<keyof EssayResponseObject | null>(null);

    const { studyStep } = useOutletContext<StudyLayoutContextType>();
    const { studyApi } = useStudy();

    const [savedResponse, setSavedResponse] = useState<EssayResponseObject>({
        familiarity: '',
        exploration: '',
        explanation: '',
    });

    const { setIsStepComplete } = useStepCompletion();

    const queryClient = useQueryClient();
    const essayMutation = useMutation({
        mutationKey: ['essayResponse'],
        mutationFn: async (newResponse: EssayResponseObject): Promise<MutationResult> => {
            const currentResponse = queryClient.getQueryData<EssayResponse>(['essayResponse']);
            const recordId = currentResponse?.id;
            const recordVersion = currentResponse?.version;
            if (recordId && recordVersion) {
                const patchPayload: EssayResponse = {
                    id: recordId,
                    payload_json: { ...newResponse },
                    version: recordVersion,
                };
                await studyApi.patch<EssayResponse, void>(`responses/interactions/${recordId}`, patchPayload);
                return {
                    type: 'PATCH',
                    id: recordId,
                    exploration: newResponse.exploration,
                    familiarity: newResponse.familiarity,
                    explanation: newResponse.explanation,
                    version: recordVersion + 1,
                };
            } else {
                const postPayload: ParticipantResponsePayload = {
                    study_step_id: studyStep.id,
                    study_step_page_id: null,
                    context_tag: `pref_viz-${condition.id}-${condition.name}`,
                    payload_json: {
                        exploration: newResponse.exploration,
                        familiarity: newResponse.familiarity,
                        explanation: newResponse.explanation,
                    },
                };
                const response = await studyApi.post<ParticipantResponsePayload, EssayResponse>(
                    'responses/interactions/',
                    postPayload
                );
                return {
                    type: 'POST',
                    id: response.id!,
                    exploration: response.payload_json.exploration,
                    familiarity: response.payload_json.familiarity,
                    explanation: response.payload_json.explanation,
                    version: response.version || 1,
                };
            }
        },
        onSuccess: (result) => {
            const newPayload = {
                familiarity: result.familiarity,
                exploration: result.exploration,
                explanation: result.explanation,
            };
            setSavedResponse(newPayload);

            queryClient.setQueryData(['essayResponse'], (oldData: EssayResponse | undefined) => ({
                ...(oldData || {}),
                id: result.id,
                version: result.version,
                payload_json: newPayload,
            }));
        },
    });

    useEffect(() => {
        if (participantResponse?.payload_json) {
            setLocalResponseDraft(participantResponse.payload_json);
            setSavedResponse(participantResponse.payload_json);
        }
    }, [participantResponse]);

    useEffect(() => {
        const allFieldsFilled =
            localResponseDraft.exploration.trim() !== '' &&
            localResponseDraft.familiarity.trim() !== '' &&
            localResponseDraft.explanation.trim() !== '';
        setIsStepComplete(allFieldsFilled);
    }, [localResponseDraft, setIsStepComplete]);

    const handleTextChange = (field: keyof EssayResponseObject, value: string) => {
        setLocalResponseDraft((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSaveClick = async () => {
        await essayMutation.mutateAsync(localResponseDraft);
        setExpandedField(null); // Close modal on save
    };

    const hasUnsavedChanges =
        localResponseDraft.familiarity !== savedResponse.familiarity ||
        localResponseDraft.exploration !== savedResponse.exploration ||
        localResponseDraft.explanation !== savedResponse.explanation;

    return (
        <div className="bg-slate-100 p-3 m-1 rounded-md text-left" id="participant-response-panel">
            <div className="my-3" id="response-instructions">
                <p className="text-sm">
                    Please use the movies recommendations on right to collect some notes for the essay that you will
                    write in the next step of the study. To help you write the essay, here are some guiding prompts, and
                    questions.
                </p>
            </div>
            {essayMutation.isPending && <p>Saving...</p>}

            {(['exploration', 'familiarity', 'explanation'] as const).map((field) => (
                <ResponseForm
                    key={field}
                    promptTag={field}
                    promptText={PROMPTS[field]}
                    text={localResponseDraft[field]}
                    onTextChange={(value) => handleTextChange(field, value)}
                    onExpand={() => setExpandedField(field)}
                />
            ))}

            <div className="text-right mt-5">
                <button
                    id="save-response-btn"
                    onClick={handleSaveClick}
                    disabled={!hasUnsavedChanges || essayMutation.isPending}
                    className={clsx(
                        'rounded-md px-4 py-2',
                        'cursor-pointer',
                        'font-medium text-white shadow-sm',
                        'bg-amber-500 hover:bg-amber-600',
                        'disabled:bg-slate-300 disabled:cursor-not-allowed'
                    )}
                >
                    {essayMutation.isPending ? 'Saving...' : 'Save Notes'}
                </button>
            </div>

            {/* Modal for Expanded View */}
            <Dialog open={expandedField !== null} onClose={() => setExpandedField(null)} className="relative z-50">
                {/* The backdrop, rendered as a fixed sibling to the panel container */}
                <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

                {/* Full-screen container to center the panel */}
                <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
                    <DialogPanel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                        <DialogTitle as="h3" className="text-lg font-medium leading-6 text-gray-900 border-b pb-2 mb-4">
                            {expandedField && Parse(PROMPTS[expandedField])}
                        </DialogTitle>

                        <div className="mt-2">
                            <textarea
                                value={expandedField ? localResponseDraft[expandedField] : ''}
                                onChange={(e) => expandedField && handleTextChange(expandedField, e.target.value)}
                                className="w-full h-[60vh] p-4 text-base rounded-md border-gray-300 focus:border-amber-500 focus:ring-amber-500 font-mono"
                                placeholder="Enter your detailed response here..."
                            />
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                                onClick={() => setExpandedField(null)}
                            >
                                Close
                            </button>
                            <button
                                type="button"
                                className="inline-flex justify-center rounded-md border border-transparent bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 disabled:opacity-50"
                                onClick={handleSaveClick}
                                disabled={!hasUnsavedChanges || essayMutation.isPending}
                            >
                                {essayMutation.isPending ? 'Saving...' : 'Save & Close'}
                            </button>
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>
        </div>
    );
};

const ResponseForm = ({
    promptTag,
    promptText,
    text,
    onTextChange,
    onExpand,
}: {
    promptTag: string;
    promptText: string;
    text: string;
    onTextChange: (text: string) => void;
    onExpand: () => void;
}) => {
    return (
        <div className="mt-5 relative group" id={`response-group-${promptTag}`}>
            <label htmlFor={promptTag} className="block mb-1 text-sm">
                {Parse(promptText)}
            </label>
            <div className="relative">
                <textarea
                    id={promptTag}
                    value={text}
                    name={promptTag}
                    placeholder="Enter your response..."
                    onChange={(evt) => onTextChange(evt.target.value)}
                    className={clsx(
                        'rounded-md',
                        'p-3 mt-1',
                        'block w-full rounded-md border-amber-400',
                        'shadow-sm focus:border-yellow-500 focus:ring-yellow-500',
                        'sm:text-sm font-mono'
                    )}
                />
                {/* Enlarge Icon - Top Right of Textarea */}
                <button
                    type="button"
                    onClick={onExpand}
                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 bg-white/50 hover:bg-white rounded-md transition-colors enlarge-text-btn"
                    title="Enlarge text area"
                    id={`enlarge-btn-${promptTag}`}
                >
                    <ArrowsPointingOutIcon className="h-5 w-5" aria-hidden="true" />
                </button>
            </div>
        </div>
    );
};

export default ParticipantResponsePanel;

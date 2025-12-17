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
    condition: { id: number; name: string };
}) => {

    const [localResponseDraft, setLocalResponseDraft] = useState<EssayResponseObject>({
        familiarity: '',
        exploration: '',
        explanation: '',
    });

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
                exploration: result.exploration,
                familiarity: result.familiarity,
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
    // FIX: Simplified auto-save effect
    // useEffect(() => {
    //     // Only save if the draft is different from what's already saved.
    //     if (JSON.stringify(localResponseDraft) === JSON.stringify(savedResponse)) {
    //         return; // Don't save if nothing has changed
    //     }

    //     const handler = setTimeout(() => {
    //         essayMutation.mutate(localResponseDraft);
    //     }, 1500); // 1.5-second debounce

    //     return () => {
    //         clearTimeout(handler);
    //     };
    // }, [localResponseDraft, savedResponse, essayMutation]);

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

    // ADD: Click handler for the save button
    const handleSaveClick = () => {

        essayMutation.mutateAsync(localResponseDraft);
    };

    // ADD: Declarative check for unsaved changes
    const hasUnsavedChanges = JSON.stringify(localResponseDraft) !== JSON.stringify(savedResponse);

    return (
        <div className="bg-slate-100 p-3 m-1 rounded-md text-left">
            <div className="my-3">
                <p>
                    Please use the movies recommendations on right to collect some notes for the essay that you will
                    write in the next step of the study. To help you write the essay, here are some guiding prompts, and
                    questions.
                </p>
            </div>
            {essayMutation.isPending && <p>Saving...</p>}
            <ResponseForm
                key={'exploration'}
                promptTag={'exploration'}
                promptText={PROMPTS.exploration}
                text={localResponseDraft.exploration}
                onTextChange={(value) => handleTextChange('exploration', value)}
            />
            <ResponseForm
                key={'familiarity'}
                promptTag={'familiarity'}
                promptText={PROMPTS.familiarity}
                text={localResponseDraft.familiarity}
                onTextChange={(value) => handleTextChange('familiarity', value)}
            />
            <ResponseForm
                key={'explanation'}
                promptTag={'explanation'}
                promptText={PROMPTS.explanation}
                text={localResponseDraft.explanation}
                onTextChange={(value) => handleTextChange('explanation', value)}
            />
            {/* ADD: Save button and container */}
            <div className="text-right mt-5">
                <button
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
        </div>
    );
};
const ResponseForm = ({
    promptTag,
    promptText,
    text,
    onTextChange,
}: {
    promptTag: string;
    promptText: string;
    text: string;
    onTextChange: (text: string) => void;
}) => {
    return (
        <div className="mt-5">
            <label htmlFor={promptTag}>{Parse(promptText)}</label>
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
        </div>
    );
};

export default ParticipantResponsePanel;

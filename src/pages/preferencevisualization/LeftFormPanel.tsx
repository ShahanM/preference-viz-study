import { useMutation, useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import Parse from 'html-react-parser';
import { useCallback, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useStudy } from 'rssa-api';
import { useDebounce } from '../../hooks/useDebounce';
import { useStepCompletion } from '../../hooks/useStepCompletion';
import type { StudyLayoutContextType } from '../../types/study.types';

type CustomFreeFormText = {
    context_tag: string;
    text: string;
};

const PROMPTS: CustomFreeFormText[] = [
    {
        context_tag: 'familiarity',
        text: '<p>Which of the movies on the visualization are you unfamiliar with?</p>',
    },
    {
        context_tag: 'exploration',
        text: `<p>Which of the movies in the visualization may help you:
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
    },
    {
        context_tag: 'explanation',
        text: `<p style="font-weight: 500">
			Use your answers above to explain the concrete steps you would take to expand your movie preferences.
		</p>`,
    },
];

interface WidgetStateProps {
    familiarity: string;
    exploration: string;
    explanation: string;
    [key: string]: string;
}

interface ResponsePayloadItem {
    context_tag: string;
    response_text: string;
}

interface TextResponsePayload {
    step_id: string;
    responses: ResponsePayloadItem[];
}

const COMPLETION_WORD_COUNT = 10;

const LeftFormPanel = () => {
    const { studyStep } = useOutletContext<StudyLayoutContextType>();
    const { setIsStepComplete } = useStepCompletion();
    const [widgetState, setWidgetState] = useState<WidgetStateProps>({
        familiarity: '',
        exploration: '',
        explanation: '',
    });
    const { studyApi } = useStudy();
    const debouncedWidgetState = useDebounce<WidgetStateProps>(widgetState, 1500); // Debounce for 1.5 seconds

    const { data: fetchedResponses, isLoading: isFetchingResponses } = useQuery({
        queryKey: ['textResponses', studyStep.id],
        queryFn: async () => {
            const response = await studyApi.get<ResponsePayloadItem[]>(`responses/text/${studyStep.id}`);
            const result: WidgetStateProps = { familiarity: '', exploration: '', explanation: '' };
            response.forEach((item) => {
                if (Object.keys(result).includes(item.context_tag)) {
                    result[item.context_tag] = item.response_text;
                }
            });
            return result;
        },
        enabled: !!studyStep.id,
    });

    useEffect(() => {
        if (fetchedResponses) {
            setWidgetState(fetchedResponses);
        }
    }, [fetchedResponses]);

    const textResponseMutation = useMutation({
        mutationKey: ['TextResponse', 'Scenario'],
        mutationFn: async (payload: TextResponsePayload) =>
            studyApi.patch<TextResponsePayload>(`responses/text`, payload),
        onSuccess: () => {
            console.log('Text responses saved successfully.');
            if (debouncedWidgetState.explanation.length >= COMPLETION_WORD_COUNT) {
                setIsStepComplete(true);
            }
        },
        onError: (error) => {
            console.error('Failed to save text responses.', error);
        },
    });

    const debouncedSave = useCallback(() => {
        const payload = {
            step_id: studyStep.id,
            responses: [
                { context_tag: 'familiarity', response_text: debouncedWidgetState.familiarity },
                { context_tag: 'exploration', response_text: debouncedWidgetState.exploration },
                { context_tag: 'explanation', response_text: debouncedWidgetState.explanation },
            ],
        };
        textResponseMutation.mutateAsync(payload);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [studyStep.id, debouncedWidgetState, textResponseMutation.mutateAsync]);

    useEffect(() => {
        const hasContent = Object.values(debouncedWidgetState).some((value) => value.length > 0);
        if (hasContent) {
            debouncedSave();
        }
    }, [debouncedWidgetState, debouncedSave]);

    return (
        <div className="bg-slate-100 p-3 m-1 rounded-md text-left">
            <div className="my-3">
                <p>
                    Please use the movies recommendations on right to collect some notes for the essay that you will
                    write in the next step of the study. To help you write the essay, here are some guiding prompts, and
                    questions.
                </p>
            </div>
            {textResponseMutation.isPending && <p>Saving...</p>}
            {PROMPTS &&
                PROMPTS.length > 0 &&
                PROMPTS.map((prompt, idx) => (
                    <div key={idx} className="mt-5">
                        <label htmlFor={prompt.context_tag}>{Parse(prompt.text)}</label>
                        <textarea
                            value={widgetState[prompt.context_tag]}
                            title={prompt.text}
                            placeholder="Respond to the prompts here."
                            onChange={(e) =>
                                setWidgetState((prev) => ({ ...prev, [prompt.context_tag]: e.target.value }))
                            }
                            className={clsx(
                                'rounded-md',
                                'p-3 mt-1',
                                'block w-full rounded-md border-amber-400',
                                'shadow-sm focus:border-yellow-500 focus:ring-yellow-500',
                                'sm:text-sm font-mono'
                            )}
                            name={prompt.context_tag}
                        />
                    </div>
                ))}
            {/* <div className="text-center">
				<button className={clsx("p-3 bg-amber-500 rounded-md mt-5 w-45", "hover:bg-amber-600 cursor-pointer")}
					onClick={debouncedSave}
					disabled={textResponseMutation.isPending}>
					Submit
				</button>
			</div> */}
        </div>
    );
};

export default LeftFormPanel;

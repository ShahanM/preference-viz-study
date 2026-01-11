import { Label, Radio, RadioGroup } from '@headlessui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import DOMPurify from 'dompurify';
import parse from 'html-react-parser';
import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useStudy } from 'rssa-api';
import { useDebounce } from 'rssa-study-template';
import type { ScaleLevel, SurveyConstructItem, SurveyItemResponse } from '../../types/rssa.types';
import type { StudyLayoutContextType } from '../../types/study.types';

interface ItemBlockProps {
    contextTag: string;
    pageId: string;
    item: SurveyConstructItem;
    initialResponse: SurveyItemResponse | undefined;
    scaleLevels: ScaleLevel[];
    onSelected: (itemId: string) => void;
}

interface ItemResponsePayload {
    step_id: string;
    step_page_id: string;
    item_id: string;
    construct_id: string;
    scale_id: string;
    scale_level_id: string;
    context_tag: string;
    version?: number;
    id?: string;
}

interface ItemResponsePatchPayload {
    id: string;
    scale_level_id: string;
    version: number;
}

interface MutationResult {
    type: 'POST' | 'PATCH';
    id: string;
    item_id: string;
    scale_level_id: string;
    version: number;
}

const ItemBlock: React.FC<ItemBlockProps> = ({
    contextTag,
    pageId,
    item,
    initialResponse,
    scaleLevels,
    onSelected,
}) => {
    const { studyStep } = useOutletContext<StudyLayoutContextType>();
    const initialSelection = initialResponse?.scale_level_id || '';
    const [selectedValue, setSelectedValue] = useState<string>(initialSelection);
    const [previousValue, setPreviousValue] = useState<string>(initialSelection);
    const { studyApi } = useStudy();
    useEffect(() => {
        if (initialResponse) {
            setSelectedValue(initialResponse.scale_level_id || '');
            setPreviousValue(initialResponse.scale_level_id || '');
            if (initialResponse.scale_level_id) onSelected(item.id);
        }
    }, [initialResponse, item.id, onSelected]);
    const scaleLevelsSorted = useMemo(() => {
        return scaleLevels.sort((a, b) => a.order_position - b.order_position);
    }, [scaleLevels]);

    const debouncedValue = useDebounce(selectedValue, 500);
    const queryClient = useQueryClient();
    const responseUpsertMutation = useMutation({
        mutationKey: ['currentPageResponses', pageId],
        mutationFn: async (newScaleLevel: string): Promise<MutationResult> => {
            if (initialResponse && initialResponse.id) {
                const patchPayload: ItemResponsePatchPayload = {
                    scale_level_id: newScaleLevel,
                    id: initialResponse.id,
                    version: initialResponse.version!, // Use version from the initial response
                };

                await studyApi.patch<ItemResponsePatchPayload, void>(
                    `responses/survey/${initialResponse.id}`,
                    patchPayload
                );

                return {
                    type: 'PATCH',
                    id: initialResponse.id,
                    item_id: initialResponse.item_id,
                    scale_level_id: newScaleLevel,
                    version: initialResponse.version! + 1,
                };
            } else {
                const postPayload: ItemResponsePayload = {
                    step_id: studyStep.id,
                    step_page_id: pageId,
                    construct_id: item.construct_id,
                    scale_id: scaleLevels[0].scale_id,
                    context_tag: contextTag,
                    item_id: item.id,
                    scale_level_id: newScaleLevel,
                };
                const response = await studyApi.post<ItemResponsePayload, SurveyItemResponse>(
                    'responses/survey/',
                    postPayload
                );

                return {
                    type: 'POST',
                    id: response.id,
                    item_id: item.id,
                    scale_level_id: response.scale_level_id,
                    version: response.version || 1,
                };
            }
        },
        onSuccess: (result) => {
            queryClient.setQueryData<SurveyItemResponse[]>(['currentPageResponses', pageId], (oldResponses) => {
                const existingResponses = oldResponses || [];
                const newResponse: SurveyItemResponse = {
                    id: result.id,
                    item_id: result.item_id,
                    scale_level_id: result.scale_level_id,
                    version: result.version,
                };

                const index = existingResponses.findIndex((res) => res.item_id === result.item_id);

                if (index > -1) {
                    return existingResponses.map((res, i) => (i === index ? newResponse : res));
                } else {
                    return [...existingResponses, newResponse];
                }
            });
            onSelected(item.id);
        },

        onError: () => {
            console.error(`Failed to save response for item ${item.id}. Rolling back selection.`);
            setSelectedValue(previousValue);
        },
    });

    useEffect(() => {
        if (debouncedValue !== '' && debouncedValue !== previousValue) {
            responseUpsertMutation.mutateAsync(debouncedValue);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedValue, responseUpsertMutation.mutateAsync, previousValue]);

    const parseHTML = (htmlstr: string) => {
        const clean = DOMPurify.sanitize(htmlstr);
        const parsed = parse(clean);
        return parsed;
    };

    const handleRadioChange = (value: string) => {
        setPreviousValue(selectedValue);
        setSelectedValue(value);
    };

    return (
        <RadioGroup
            value={selectedValue}
            onChange={handleRadioChange}
            className="my-1 py-1 bg-gray-50 rounded-md"
            disabled={responseUpsertMutation.isPending}
        >
            <Label className="text-left p-3 text-md fw-normal">{parseHTML(item.display_name)}</Label>
            <div className="m-2 p-2 flex items-center gap-3">
                {scaleLevelsSorted.map((level) => (
                    <Radio
                        key={level.id}
                        value={level.id.toString()}
                        className={({ focus, checked }) =>
                            clsx(
                                'cursor-pointer rounded-md border w-30 h-11 text-sm content-center justify-items-center',
                                focus && 'ring-2 ring-yellow-400 ring-offset-2',
                                {
                                    'border-yellow-400 bg-amber-500 text-gray-700': checked,
                                    'border-gray-300 bg-slate-300 text-gray-700 hover:bg-amber-500': !checked,
                                }
                            )
                        }
                    >
                        <Label>{level.display_name}</Label>
                    </Radio>
                ))}
            </div>
        </RadioGroup>
    );
};

export default ItemBlock;

import { Label, Radio, RadioGroup } from '@headlessui/react';
import { useMutation } from '@tanstack/react-query';
import clsx from 'clsx';
import DOMPurify from 'dompurify';
import parse from 'html-react-parser';
import { useEffect, useMemo, useState } from 'react';
import { useStudy } from 'rssa-api';
import { useDebounce } from '../../hooks/useDebounce';
import { usePageCompletion } from '../../hooks/usePageCompletion';
import type { ScaleLevel, SurveyConstructItem } from '../../types/rssa.types';

interface ItemBlockProps {
    item: SurveyConstructItem;
    scaleLevels: ScaleLevel[];
    onSelected: (itemId: string) => void;
}

interface ItemResponsePayload {
    item_id: string;
    construct_id: string;
    scale_id: string;
    scale_level_id: string;
}

const ItemBlock: React.FC<ItemBlockProps> = ({ item, scaleLevels, onSelected }) => {
    const [selectedValue, setSelectedValue] = useState<string>('');
    const [previousValue, setPreviousValue] = useState<string>('');
    const { isPageComplete } = usePageCompletion();
    const { studyApi } = useStudy();

    const scaleLevelsSorted = useMemo(() => {
        return scaleLevels.sort((a, b) => a.order_position - b.order_position);
    }, [scaleLevels]);

    const debouncedValue = useDebounce(selectedValue, 500);

    const responseMutation = useMutation({
        mutationKey: ['item', item.id, item.construct_id],
        mutationFn: (responsePayload: ItemResponsePayload) =>
            studyApi.patch<ItemResponsePayload>(`responses/survey`, responsePayload),
        onSuccess: () => {
            onSelected(item.id);
        },
        onError: () => {
            console.error(`Failed to save response for item ${item.id}. Rolling back selection.`);
            setSelectedValue(previousValue);
        },
    });

    useEffect(() => {
        if (debouncedValue !== '') {
            const resPayload = {
                item_id: item.id,
                construct_id: item.construct_id,
                scale_id: scaleLevels[0].scale_id,
                scale_level_id: debouncedValue,
            };
            responseMutation.mutateAsync(resPayload);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedValue, item.id, item.construct_id, scaleLevels, responseMutation.mutateAsync]);

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
            disabled={responseMutation.isPending || isPageComplete}
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

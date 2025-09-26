import { useCallback, useEffect, useState } from 'react';
import ItemBlock from './ItemBlock';
import type { ScaleLevel, SurveyConstructItem } from '../../types/rssa.types';

interface ContentBlockProps {
    contentId: string;
    items: SurveyConstructItem[];
    scaleLevels: ScaleLevel[];
    onComplete: (contentId: string) => void;
}

const ContentBlock: React.FC<ContentBlockProps> = ({ contentId, items, scaleLevels, onComplete }) => {
    const [answeredItemIds, setAnsweredItemIds] = useState<Set<string>>(new Set());

    const handleSelection = useCallback((itemId: string) => {
        setAnsweredItemIds((prev) => new Set(prev).add(itemId));
    }, []);

    useEffect(() => {
        if (answeredItemIds.size === items.length) onComplete(contentId);
    }, [answeredItemIds.size, items.length, onComplete, contentId]);

    return (
        <div className="mx-auto p-3 justify-items-center">
            {items.map((item) => (
                <ItemBlock key={item.id} item={item} scaleLevels={scaleLevels} onSelected={handleSelection} />
            ))}
        </div>
    );
};

export default ContentBlock;

import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { useStudy } from 'rssa-api';
import type { PageContent, SurveyItemResponse } from '../../types/rssa.types';
import ItemBlock from './ItemBlock';

interface ContentBlockProps {
    content: PageContent;
    onComplete: (contentId: string) => void;
}

const ContentBlock: React.FC<ContentBlockProps> = ({ content, onComplete }) => {
    const [answeredItemIds, setAnsweredItemIds] = useState<Set<string>>(new Set());
    const { studyApi } = useStudy();

    const { data: currentPageResponses } = useQuery({
        queryKey: ['currentPageResponses', content.page_id],
        queryFn: async () => studyApi.get<SurveyItemResponse[]>(`responses/survey/${content.page_id!}`),
        select: (data) => (Array.isArray(data) ? data : []),
        enabled: !!content.page_id,
    });

    const handleSelection = useCallback((itemId: string) => {
        setAnsweredItemIds((prev) => new Set(prev).add(itemId));
    }, []);

    useEffect(() => {
        if (answeredItemIds.size === content.items.length) onComplete(content.id);
    }, [answeredItemIds.size, content, onComplete]);

    return (
        <div className="justify-items-center">
            {content.items.map((item) => {
                const currentResponses = currentPageResponses?.find(
                    (itemRes: SurveyItemResponse) => itemRes.item_id === item.id
                );
                return (
                    <ItemBlock
                        contextTag={content.display_name}
                        pageId={content.page_id}
                        key={item.id}
                        item={item}
                        initialResponse={currentResponses}
                        scaleLevels={content.scale_levels}
                        onSelected={handleSelection}
                    />
                );
            })}
        </div>
    );
};

export default ContentBlock;

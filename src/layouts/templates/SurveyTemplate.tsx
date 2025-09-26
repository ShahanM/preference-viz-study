import { useCallback, useEffect, useState } from 'react';
import type { PageContent } from '../../types/rssa.types';
import ContentBlock from './ContentBlock';

interface SurveyTemplateProps {
    pageContents: PageContent[];
    onComplete: () => void;
}

const SurveyTemplate: React.FC<SurveyTemplateProps> = ({ pageContents, onComplete }) => {
    const [completedContentIds, setCompletedContentIds] = useState<Set<string>>(new Set());

    const handelCompletion = useCallback((contentId: string) => {
        setCompletedContentIds((prev) => new Set(prev).add(contentId));
    }, []);

    useEffect(() => {
        if (completedContentIds.size === pageContents.length) onComplete();
    });

    return (
        <>
            {pageContents.map((pageContent, index) => (
                <div key={pageContent.id + '_' + index}>
                    <p>{pageContent.preamble || ''}</p>
                    <ContentBlock
                        contentId={pageContent.id}
                        items={pageContent.items}
                        scaleLevels={pageContent.scale_levels}
                        onComplete={handelCompletion}
                    />
                </div>
            ))}
        </>
    );
};

export default SurveyTemplate;

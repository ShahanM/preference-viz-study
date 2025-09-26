import { ChevronRightIcon } from '@heroicons/react/24/solid';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useStudy } from 'rssa-api';
import { usePageCompletion } from '../hooks/usePageCompletion';
import { useStepCompletion } from '../hooks/useStepCompletion';
import SurveyTemplate from '../layouts/templates/SurveyTemplate';
import type { SurveyPageType } from '../types/rssa.types';
import type { StudyLayoutContextType } from '../types/study.types';
import LoadingScreen from '../components/loadingscreen/LoadingScreen';

const SurveyPage: React.FC = () => {
    const { studyStep } = useOutletContext<StudyLayoutContextType>();
    const { studyApi } = useStudy();
    const [currentPageId, setCurrentPageId] = useState<string | null>(null);
    const { setIsStepComplete } = useStepCompletion();
    const { isPageComplete, setIsPageComplete } = usePageCompletion();
    useEffect(() => {
        if (studyStep.survey_api_root) setCurrentPageId(studyStep.survey_api_root);
    }, [studyStep.survey_api_root]);

    const {
        data: currentPage,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['surveyPage', currentPageId],
        queryFn: () => studyApi.get<SurveyPageType>(`pages/${currentPageId}`),
        enabled: !!currentPageId,
        refetchOnWindowFocus: false,
    });
    useEffect(() => {
        if (currentPageId) {
            setIsPageComplete(false);
        }
    }, [currentPageId, setIsPageComplete]);

    useEffect(() => {
        if (isPageComplete && currentPage && currentPage.next === null) {
            setIsStepComplete(true);
        }
    }, [isPageComplete, currentPage, setIsStepComplete]);

    const handleNextPage = () => {
        if (currentPage && currentPage.next) {
            setCurrentPageId(currentPage.next);
        }
    };

    if (!currentPage) {
        return <LoadingScreen loading={true} message="Loading survey page..." />;
    }
    const renderNextButton = currentPage.next !== null;
    return (
        <div className="flex justify-content-evenly px-5">
            <div className="ms-5">
                <SurveyTemplate pageContents={currentPage.page_content!} onComplete={() => setIsPageComplete(true)} />
            </div>
            <div className="content-center me-5">
                {renderNextButton ? (
                    <button
                        disabled={!isPageComplete}
                        className={clsx(
                            ' p-2 w-18 h-36 rounded-3',
                            !isPageComplete
                                ? 'cursor-not-allowed bg-gray-200 text-white'
                                : 'bg-amber-400 hover:bg-orange-400 cursor-pointer'
                        )}
                        onClick={handleNextPage}
                    >
                        <ChevronRightIcon className="size-9 mx-auto" />
                        <span className="hidden">Next survey page</span>
                    </button>
                ) : (
                    <></>
                )}
            </div>
        </div>
    );
};

export default SurveyPage;

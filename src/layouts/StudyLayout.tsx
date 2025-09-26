import { useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { PageCompletionProvider } from '../contexts/pageCompletionContext';
import { StepCompletionProvider } from '../contexts/stepCompletionContext';
import type { StudyStep } from '../types/rssa.types';
import type { StudyLayoutContextType } from '../types/study.types';
import Footer from './StudyFooter';
import Header from './StudyHeader';

interface StudyLayoutProps {
    stepApiData: StudyStep | undefined;
}

const StudyLayoutContent: React.FC<StudyLayoutProps> = ({ stepApiData }) => {
    const navigate = useNavigate();
    const outletContextValue: StudyLayoutContextType = {
        studyStep: stepApiData!,
    };

    const handleNextButtonClick = useCallback(() => {
        if (!stepApiData) return;
        navigate(stepApiData.next!);
    }, [stepApiData, navigate]);

    return (
        <div>
            <Header
                title={stepApiData?.title || stepApiData?.name || 'Step missing title.'}
                content={
                    stepApiData?.instructions ||
                    stepApiData?.description ||
                    'Step is missing description or instructions.'
                }
            />
            {stepApiData && <Outlet context={outletContextValue} />}
            <Footer onNextButtonClick={handleNextButtonClick} />
        </div>
    );
};

const StudyLayout = ({ stepApiData }: StudyLayoutProps) => {
    return (
        <StepCompletionProvider>
            <PageCompletionProvider>
                <StudyLayoutContent stepApiData={stepApiData} />
            </PageCompletionProvider>
        </StepCompletionProvider>
    );
};

export default StudyLayout;

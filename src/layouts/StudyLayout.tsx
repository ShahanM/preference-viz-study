import { Fragment, useCallback, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { PageCompletionProvider } from '../contexts/pageCompletionProvider';
import { StepCompletionProvider } from '../contexts/stepCompletionProvider';
import type { StudyStep } from '../types/rssa.types';
import type { StudyLayoutContextType } from '../types/study.types';
import Footer from './StudyFooter';
import Header from './StudyHeader';
import { useStepCompletion } from '../hooks/useStepCompletion';
import { useNextButtonControl } from '../hooks/useNextButtonControl';
import LoadingScreen from '../components/loadingscreen/LoadingScreen';
import { Button } from '@headlessui/react';
import clsx from 'clsx';
import { NextButtonControlProvider } from '../contexts/NextButtonControlProvider';

interface StudyLayoutProps {
    stepApiData: StudyStep | undefined;
}

const StudyLayoutContent: React.FC<StudyLayoutProps> = ({ stepApiData }) => {
    const navigate = useNavigate();
    const { isStepComplete, setIsStepComplete } = useStepCompletion();
    const { setButtonControl, buttonControl } = useNextButtonControl();

    const handleNextButtonClick = useCallback(() => {
        if (!stepApiData) return;
        navigate(stepApiData.next!);
        setIsStepComplete(false);
    }, [stepApiData, navigate, setIsStepComplete]);

    const handleNextButtonReset = useCallback(() => {
        setButtonControl({
            label: 'Next',
            action: handleNextButtonClick,
            isDisabled: !isStepComplete,
        });
    }, [isStepComplete, setButtonControl, handleNextButtonClick]);

    const outletContextValue: StudyLayoutContextType = {
        studyStep: stepApiData!,
        resetNextButton: handleNextButtonReset,
    };

    useEffect(() => {
        setButtonControl({
            label: 'Next',
            action: handleNextButtonClick,
            isDisabled: !isStepComplete,
        });
    }, [handleNextButtonClick, isStepComplete, setButtonControl]);

    if (!stepApiData) return <LoadingScreen loading={!stepApiData} message={'Study page is loading'} />;

    return (
        <div className="flex flex-col min-h-screen">
            <Header
                title={stepApiData?.title || stepApiData?.name || 'Step missing title.'}
                content={
                    stepApiData?.instructions ||
                    stepApiData?.description ||
                    'Step is missing description or instructions.'
                }
            />
            <main className="flex-grow mx-auto max-w-screen-xl px-2 text-end rounded-md">
                <Outlet context={outletContextValue} />
                <nav className="p-4 bg-gray-200">
                    <Button as={Fragment} disabled={buttonControl.isDisabled}>
                        {({ hover, active, disabled }) => (
                            <button
                                onClick={buttonControl.action}
                                disabled={disabled}
                                className={clsx(
                                    'px-6 py-3 rounded-lg',
                                    'font-medium',
                                    disabled
                                        ? 'bg-orange-300 cursor-not-allowed text-gray-400'
                                        : 'bg-amber-500 cursor-pointer text-white',
                                    (hover || active) && 'bg-amber-600 text-white'
                                )}
                            >
                                {buttonControl.label}
                            </button>
                        )}
                    </Button>
                </nav>
            </main>
            <Footer />
        </div>
    );
};

const StudyLayout = ({ stepApiData }: StudyLayoutProps) => {
    return (
        <StepCompletionProvider>
            <PageCompletionProvider>
                <NextButtonControlProvider>
                    <StudyLayoutContent stepApiData={stepApiData} />
                </NextButtonControlProvider>
            </PageCompletionProvider>
        </StepCompletionProvider>
    );
};

export default StudyLayout;

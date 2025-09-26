import { useMutation } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParticipant, useStudy } from 'rssa-api';
import ContinueFormModal from '../components/ContinueFormModal';
import { useStudyConfig } from '../hooks/useStudyConfig';
import Header from '../layouts/StudyHeader';
import WelcomeFooter from '../layouts/WelcomeFooter';

export interface ResumePayload {
    resume_code: string;
}
export interface ResumeResponse {
    current_step_id: string;
    current_page_id: string;
    token: string;
}

const WelcomePage: React.FC<{ isStudyReady: boolean; onStudyStart: () => void }> = ({ isStudyReady, onStudyStart }) => {
    const [showCodeForm, setShowCodeForm] = useState<boolean>(false);

    const { studyApi } = useStudy();
    const { setJwt } = useParticipant();
    const studyId = useMemo(() => studyApi.getStudyId(), [studyApi]);

    const { data: config } = useStudyConfig(studyId!);

    const navigate = useNavigate();

    const resumeMutation = useMutation({
        mutationFn: (resumeCode: string) => {
            return studyApi.post<ResumeResponse, ResumePayload>(`studies/${studyId}/resume`, {
                resume_code: resumeCode,
            });
        },
        onSuccess: (data: ResumeResponse) => {
            setJwt(data.token);
            const stepFromConfig = config?.steps.find((step) => step.step_id === data.current_step_id);
            if (stepFromConfig) navigate(stepFromConfig.path);
            else throw new Error('Something went wrong. Could not resolve resume path.');
        },
        onError: (error) => {
            console.error('Resume failed:', error.message);
        },
    });

    const studyStepList = [
        'Complete a pre-survey.',
        'Rate a few movies you are familiar with to let recommender system know about your movie preferences.',
        'Interact with the movie recommender system.',
        'Complete a post-survey.',
    ];
    return (
        <div className="p-5 m-5">
            <Header title={'Welcome'} content={'Welcome to the study on movie recommendations.'} />
            <ContinueFormModal
                isOpen={showCodeForm}
                onClose={() => setShowCodeForm(false)}
                title="Resume previous session"
                onSubmit={(code) => resumeMutation.mutate(code)}
                isSubmitting={resumeMutation.isPending}
                submitButtonText="Submit"
            />
            <div className="m-3 p-5 text-left rounded-3">
                <h3 className="mb-3">What can you expect?</h3>
                <p>In this study you will test a new recommender system for movies.</p>
                <p>There are four steps to the study:</p>
                <ol>
                    {studyStepList.map((val, idx) => (
                        <li key={idx} className="p-1 list-decimal">
                            {val}
                        </li>
                    ))}
                </ol>
                <p>
                    Thanks,
                    <br />
                    Research Team
                </p>
            </div>
            <WelcomeFooter
                onStudyStart={onStudyStart}
                onStudyContinue={setShowCodeForm}
                disabled={!isStudyReady}
                text={'Start study'}
            />
        </div>
    );
};

export default WelcomePage;

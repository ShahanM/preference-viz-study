import { useIsRestoring } from '@tanstack/react-query';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useStudy } from 'rssa-api';
import { useStudyConfig } from '../hooks/useStudyConfig';
import StudyLayout from '../layouts/StudyLayout';
import '../styles/_custom-bootstrap.scss';
import '../styles/App.css';
import '../styles/components.css';
import type { StudyStep } from '../types/rssa.types';
import { componentMap } from './componentMap';
import WelcomePage from './WelcomePage';

const RouteWrapper: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { studyApi } = useStudy();

    const isRestoring = useIsRestoring();

    const studyId = useMemo(() => studyApi.getStudyId(), [studyApi]);
    if (!studyId) {
        throw new Error('VITE_STUDY_ID is missing. Please ensure it is set in your environment file.');
    }
    const { data: config, isLoading } = useStudyConfig(studyId!);
    const [currentStepData, setCurrentStepData] = useState<StudyStep>();

    useEffect(() => {
        if (!config) return;

        const currentPath = location.pathname;
        const stepFromConfig = config.steps.find((step) => step.path === currentPath);

        if (stepFromConfig && stepFromConfig.step_id !== currentStepData?.id) {
            studyApi.get<StudyStep>(`steps/${stepFromConfig.step_id}`).then((data) => {
                setCurrentStepData(data);
            });
        }
    }, [location.pathname, config, studyApi, currentStepData]);

    const handleStartStudy = async () => {
        if (!config?.study_id) return;

        const firstStep = await studyApi.get<StudyStep>(`studies/${config.study_id}/steps/first`);
        if (firstStep) {
            console.log(firstStep);
            setCurrentStepData(firstStep);
            navigate(firstStep.path);
        }
    };

    if (isRestoring) {
        return <div>Restoring session...</div>;
    }
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Routes>
                <Route
                    path="/welcome"
                    element={<WelcomePage isStudyReady={!isLoading} onStudyStart={handleStartStudy} />}
                />
                <Route path="/" element={<Navigate to="/welcome" replace />} />
                <Route path="/" element={<StudyLayout stepApiData={currentStepData} />}>
                    {config?.steps.map(({ step_id, path, component_type }) => {
                        const Component = componentMap[component_type];
                        return Component ? <Route key={step_id} path={path} element={<Component />} /> : null;
                    })}
                </Route>
            </Routes>
        </Suspense>
    );
};

export default RouteWrapper;

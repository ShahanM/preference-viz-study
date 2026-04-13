import { useFetchParticipant } from '@rssa-project/api';
import { type StudyLayoutContextType, useStepCompletion } from '@rssa-project/study-template';
import { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { PCallout, PSubhead, PVSpaced } from '../components/styled/Font';
import { conditionMap } from './preferencevisualization/conditionMap';

const ScenarioPage: React.FC = () => {
    const { showButtonLoader } = useOutletContext<StudyLayoutContextType>();
    const { setIsStepComplete } = useStepCompletion();
    const { data: participant } = useFetchParticipant();
    const externalCode = participant?.study_condition?.view_link_key;

    useEffect(() => {
        setIsStepComplete(false);
        showButtonLoader(true);
        const timerId = setTimeout(() => {
            setIsStepComplete(true);
            showButtonLoader(false);
        }, 3000);
        return () => {
            clearTimeout(timerId);
        };
    }, [setIsStepComplete, showButtonLoader]);
    return (
        <div className="w-full justify-items-center">
            <div className="p-5 m-3 text-left max-w-270">
                <PCallout>Your task</PCallout>
                <p className="mt-3">
                    Imagine you are in a movie critiquing class. One of your assignments is to reflect on your movie
                    preferences and to write an essay about what you learned in your reflection. The task of this study
                    is to write personal reflection notes to help you write the essay. To help you reflect on your movie
                    preferences, you will use a
                    <span className="ms-1 me-1 font-bold">“preference visualization system”</span>
                    <span>{conditionMap[externalCode!]?.scenarioText}</span>.
                </p>
                <PSubhead>Why should I care about understanding and developing my preferences?</PSubhead>
                <PVSpaced>
                    We usually have a baseline understanding of movies that we like and dislike. Our movie-watching
                    behavior tends to be motivated by these likes and dislikes. Reflecting on your movie preferences can
                    help you discover these nuances, refine your likes and dislikes, and explore the range of your
                    preferences. Along the way, you may open new avenues to explore movies that you had not considered
                    before.
                </PVSpaced>
            </div>
        </div>
    );
};

export default ScenarioPage;

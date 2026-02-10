import { type StudyLayoutContextType, useStepCompletion } from '@rssa-project/study-template';
import { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import rsinteract from '../res/interact.png';
import postsurvey from '../res/post-survey.png';
import presurvey from '../res/pre-survey.png';
import rspref from '../res/rate-prefs.png';

const StudyOverviewPage: React.FC = () => {
    const { showButtonLoader } = useOutletContext<StudyLayoutContextType>();
    const { setIsStepComplete } = useStepCompletion();

    const stepCards = [
        { img: presurvey, text: 'Pre-survey' },
        { img: rspref, text: 'Indicate your preference' },
        { img: rsinteract, text: 'Interact with the system' },
        { img: postsurvey, text: 'Post-survey' },
    ];

    useEffect(() => {
        setIsStepComplete(false);
        showButtonLoader(true);
        const timerId = setTimeout(() => {
            setIsStepComplete(true);
            showButtonLoader(false);
        }, 1000);
        return () => {
            clearTimeout(timerId);
        };
    }, [setIsStepComplete, showButtonLoader]);

    return (
        <div className="flex flex-between text-2xl mb-3">
            {stepCards.map((card, idx) => (
                <div key={idx}>
                    <img src={card.img} alt={card.text} />
                    <p className="text-center">{card.text}</p>
                </div>
            ))}
        </div>
    );
};

export default StudyOverviewPage;

import React from 'react';
import { WelcomePage as GenericWelcomePage } from 'rssa-study-template';

const WelcomeContent: React.FC = () => {
    return (
        <div className="m-3 p-5 text-left rounded-3">
            <h3 className="mb-3">What can you expect?</h3>
            <p>In this study you will test a new recommender system for movies.</p>
            <p>There are four steps to the study:</p>
            <ol>
                <li className="p-1 list-decimal">Complete a pre-survey.</li>
                <li className="p-1 list-decimal">
                    Rate a few movies you are familiar with to let recommender system know about your movie preferences.
                </li>
                <li className="p-1 list-decimal">Interact with the movie recommender system.</li>
                <li className="p-1 list-decimal">Complete a post-survey.</li>
            </ol>
            <p>
                Thanks,
                <br />
                Research Team
            </p>
        </div>
    );
};

const WelcomePage: React.FC<{ isStudyReady: boolean; onStudyStart: () => void }> = (props) => {
    return <GenericWelcomePage {...props} ContentComponent={WelcomeContent} />;
};

export default WelcomePage;

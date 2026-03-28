import React from 'react';
import { WelcomePage as GenericWelcomePage } from '@rssa-project/study-template';
import { NumberedList, PCallout, PVSpaced } from '../components/styled/Font';

const WelcomeContent: React.FC = () => {
    const steps = [
        'Complete a pre-survey',
        'Rate a few movies you are familiar with to let recommender system know about your movie preferences.',
        'Interact with the movie recommender system.',
        'Complete a post-survey.',
    ];
    return (
        <div className="m-3 p-5 text-left rounded-3">
            <PCallout>What can you expect?</PCallout>
            <PVSpaced>In this study you will test a new system for movies preferences.</PVSpaced>
            <p>There are four steps to the study:</p>
            <NumberedList>{steps}</NumberedList>
            <p>Thanks,</p>
            <p>Research Team</p>
        </div>
    );
};

const WelcomePage: React.FC<{ isStudyReady: boolean; onStudyStart: () => void }> = (props) => {
    return (
        <GenericWelcomePage
            title={'Welcome'}
            subtitle={'Movie Preferences'}
            {...props}
            ContentComponent={WelcomeContent}
        />
    );
};

export default WelcomePage;

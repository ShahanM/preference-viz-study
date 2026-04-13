import React from 'react';
import { WelcomePage as GenericWelcomePage } from '@rssa-project/study-template';
import { NumberedList, PCallout, PVSpaced } from '../components/styled/Font';

const WelcomeContent: React.FC = () => {
    const steps = [
        'Complete a short pre-survey (~1 min)',
        'Rate at least 10 movies you are familiar with, to let the system know your preferences (~ 3 min).',
        'Write reflection notes while interacting with the system (~10 min).',
        'Complete a post-survey. (~3 min)',
    ];
    return (
        <div className="m-3 p-5 text-left rounded-3">
            <PCallout>What can you expect?</PCallout>
            <PVSpaced>
                In this study you will reflect on your movie preferences with the help of a preference visualization
                system. There are four steps to the study:
            </PVSpaced>
            <p>There are four steps to the study:</p>
            <NumberedList>{steps}</NumberedList>
            <PVSpaced>
                Please note that we manually check all entries. To receive payment, please carefully complete all four
                steps.
            </PVSpaced>
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

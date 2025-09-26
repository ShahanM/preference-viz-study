import { Checkbox } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/24/solid';
import { useMutation } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { useCallback, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useParticipant, useStudy } from 'rssa-api';
import { useStepCompletion } from '../hooks/useStepCompletion';
import type { StudyLayoutContextType } from '../types/study.types';

export interface BaseParticipant {
    participant_type_id: string;
    external_id: string;
    current_step_id: string;
    current_page_id?: string | null;
}

export interface Participant extends BaseParticipant {
    study_id: string;
    conition_id: string;
    current_status: string;
}

export interface ParticipantTokenObject {
    resume_code: string;
    token: string;
}

const InformedConsent: React.FC = () => {
    const { studyStep } = useOutletContext<StudyLayoutContextType>();

    const { studyApi } = useStudy();
    const { setJwt } = useParticipant();
    const [agreed, setAgreed] = useState(false);
    const [resumeCode, setResumeCode] = useState<string>();
    const { isStepComplete, setIsStepComplete } = useStepCompletion();

    const consentMutation = useMutation({
        mutationFn: (participantData: BaseParticipant) => {
            return studyApi.post<ParticipantTokenObject, BaseParticipant>(
                `studies/${studyApi.getStudyId()}/new-participant`,
                participantData
            );
        },
        onSuccess: (tokenObject) => {
            setJwt(tokenObject.token);
            setResumeCode(tokenObject.resume_code);
            setIsStepComplete(true);
        },
        onError: (error) => {
            setIsStepComplete(false);
            console.error('Error creating participant:', error);
        },
    });

    const handleConsent = useCallback(async () => {
        if (!studyStep) return;
        consentMutation.mutate({
            participant_type_id: '149078d0-cece-4b2c-81cd-a7df4f76d15a',
            external_id: 'N/A',
            current_step_id: studyStep?.id,
        });
    }, [studyStep, consentMutation]);

    const consentButtonDisabled = !agreed || consentMutation.isPending || isStepComplete;

    return (
        <div>
            <div className="ps-3 pt-3 pe-3 ms-3 mt-3 me-3 text-left">
                <h3>Call for Participation and Consent</h3>
                <p>
                    Dr. Bart Knijnenburg is inviting you to volunteer for a research study. Dr. Bart Knijnenburg is an
                    Associate Professor at Clemson University conducting the study with graduate students. In this
                    study, you will be asked to interact with a movie recommender system.
                </p>
                <h4 className="mt-3">Study Purpose</h4>
                <p>
                    The goal of this study is to support users in developing, exploring, and understanding their unique
                    personal preferences to help them escape the trap of "Filter bubbles," a problematic side effect of
                    recommendation technology that is otherwise meant to help make decisions. To support users and
                    understand their unique personal taste, we designed a movie rating system that displays items beyond
                    the top-rated ones to help both the users understand their tastes and recommenders get a better idea
                    of users' tastes. In this experiment, we will ask users to rate N number of movies in our system and
                    complete a survey pertaining to their thoughts about how the movies helped them learn, grow, and
                    expand their preferences.
                </p>

                <h4 className="mt-3">Eligibility</h4>
                <p>
                    Please note that you may only participate in this study once. Previous participants in this study
                    are not eligible to participate again. When you participate, please carefully perform every task and
                    read each question before you provide your answers. We are not able to pay workers who just click
                    through without paying attention to what they are doing. If your attention drops or your mouse hand
                    gets tired, please take a short break before continuing the study. Feel free to take it easy. Please
                    feel free to reach out to Sushmita Khan (sushmik@clemson.edu) if you have any questions. Thank you
                    for your time!
                </p>

                <h4 className="mt-3">Time and Compensation</h4>
                <p>
                    It will take about 15 to 20 minutes to complete the study, and you will receive&nbsp;
                    <span className="textemph">$2.75</span>&nbsp; upon completion. Participation is voluntary. Please
                    feel free to reach out to Sushmita Khan (sushmik@clemson.edu) if you have any questions. Thank you
                    for your time!
                </p>
            </div>
            <div className="flex items-center gap-x-3 ms-4 p-3 rounded-lg mt-3">
                <Checkbox
                    checked={agreed}
                    onChange={setAgreed}
                    className={clsx(
                        'group h-6 w-6 rounded-md p-1',
                        'ring-1 ring-inset ring-gray-300',
                        'data-[checked]:bg-amber-500 data-[checked]:ring-amber-300',
                        'cursor-pointer',
                        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-300'
                    )}
                    disabled={isStepComplete}
                >
                    <CheckIcon className="hidden h-4 w-4 fill-white group-data-[checked]:block" />
                </Checkbox>
                <label
                    htmlFor="consent-checkbox"
                    className="text-gray-700 select-none"
                    onClick={() => setAgreed(!agreed)}
                >
                    I have read and understood the study information, and I consent to participate.
                </label>
            </div>
            <button
                className={clsx(
                    'm-3 p-3 rounded-md',
                    consentButtonDisabled
                        ? 'bg-gray-400 text-gray-500 cursor-not-allowed'
                        : 'bg-amber-500 hover:bg-amber-600 text-gray-800 hover:text-gray-100 cursor-pointer'
                )}
                onClick={handleConsent}
                disabled={consentButtonDisabled}
            >
                {consentMutation.isPending
                    ? 'Submitting response...'
                    : isStepComplete
                      ? 'Consent recorded.'
                      : 'I consent to participate in this study'}
            </button>
            {resumeCode && (
                <div>
                    <p>Thank you for agreeing to participate in the study.</p>
                    <div
                        className={clsx(
                            'p-4 mx-auto mt-3 mb-3 w-45 h-30 bg-gray-200 rounded-md',
                            'text-3xl text-center content-center text-amber-900'
                        )}
                    >
                        <code>{resumeCode}</code>
                    </div>
                    <div>
                        <p>
                            Please copy the code above. In case the study session fails, you may be able to resume the
                            study by using the code.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InformedConsent;

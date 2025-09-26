import { useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setUrlCache } from '../slices/navigationSlice';
import { clearParticipant } from '../slices/participantSlice';
import { clearStudyStep } from '../slices/studyStepSlice';
import { clearStorage } from '../utils/localStorageUtils';

const StudyRestartButton = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isInternalNavigationRef = useRef(false);

    const handleStudyRestart = () => {
        dispatch(clearParticipant());
        dispatch(clearStudyStep());
        dispatch(setUrlCache('/'));

        clearStorage();
        isInternalNavigationRef.current = true;
        navigate('/');

        // setShowStudyRestartDialog(false);
    };

    return <button onClick={handleStudyRestart}>Restart Study</button>;
};

export default StudyRestartButton;

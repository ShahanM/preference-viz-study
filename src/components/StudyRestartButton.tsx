import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearStorage } from '../utils/localStorageUtils';

const StudyRestartButton = () => {
    const navigate = useNavigate();
    const isInternalNavigationRef = useRef(false);

    const handleStudyRestart = () => {
        clearStorage();
        isInternalNavigationRef.current = true;
        navigate('/');

        // setShowStudyRestartDialog(false);
    };

    return <button onClick={handleStudyRestart}>Restart Study</button>;
};

export default StudyRestartButton;

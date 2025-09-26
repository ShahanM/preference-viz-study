import { useEffect, useState, type ReactNode } from 'react';
import { ParticipantContext } from '../hooks/useParticipant';

export const ParticipantProvider = ({ children }: { children: ReactNode }) => {
    const [jwt, setJwt] = useState<string | null>(() => {
        return localStorage.getItem('participant_jwt');
    });

    useEffect(() => {
        if (jwt) {
            localStorage.setItem('participant_jwt', jwt);
        } else {
            localStorage.removeItem('participant_jwt');
        }
    }, [jwt]);

    const value = { jwt, setJwt };

    return <ParticipantContext.Provider value={value}>{children}</ParticipantContext.Provider>;
};

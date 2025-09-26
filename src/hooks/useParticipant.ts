import { createContext, useContext } from 'react';

interface ParticipantContextType {
    jwt: string | null;
    setJwt: (jwt: string | null) => void;
}

export const ParticipantContext = createContext<ParticipantContextType | undefined>(undefined);

export const useParticipant = () => {
    const context = useContext(ParticipantContext);
    if (context === undefined) {
        throw new Error('useParticipant must be used within a ParticipantProvider');
    }
    return context;
};

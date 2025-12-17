import { useState, type ReactNode } from 'react';
import { MovieSelectionContext } from '../hooks/useMovieSelection';
import type { Movie } from '../types/rssa.types';

export const MovieSelectionProvider = <T extends Movie>({ children }: { children: ReactNode }) => {
    const [selectedMovie, setSelectedMovie] = useState<T | undefined>(undefined);
    const value = { selectedMovie, setSelectedMovie };

    return <MovieSelectionContext.Provider value={value}>{children}</MovieSelectionContext.Provider>;
};

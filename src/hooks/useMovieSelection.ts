import type { Movie } from '@rssa-project/study-template';
import { createContext, useContext } from 'react';

export interface MovieSelectionContextType<T extends Movie> {
    selectedMovie: T | undefined;
    setSelectedMovie: (item: T | undefined) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MovieSelectionContext = createContext<MovieSelectionContextType<any> | undefined>(undefined);

export const useMovieSelection = <T extends Movie>() => {
    const context = useContext(MovieSelectionContext);
    if (context === undefined) {
        throw new Error('useMovieSelection must be used within a MovieSelectionProvider');
    }
    return context as MovieSelectionContextType<T>;
};

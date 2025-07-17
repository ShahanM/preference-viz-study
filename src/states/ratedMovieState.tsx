import { atom } from 'recoil';
import { MovieRating } from '../widgets/moviegrid/moviegriditem/MovieGridItem.types';


export const ratedMoviesState = atom<Map<string, MovieRating>>({
    key: 'ratedMoviesState',
    default: new Map<string, MovieRating>(),

    // atomEffect for localStorage persistence
    // Note: effects_UNSTABLE is the current stable name for atomEffect in Recoil 0.7+
    effects: [
        ({ setSelf, onSet }) => {
            const storedData = localStorage.getItem('ratedMoviesData');
            if (storedData) {
                try {
                    const parsedData: { [key: string]: MovieRating } = JSON.parse(storedData);
                    const loadedMap = new Map<string, MovieRating>(
                        Object.values(parsedData).map(movie => [movie.id, movie])
                    );
                    setSelf(loadedMap);
                } catch (e) {
                    console.error("Error parsing rated movies from localStorage, clearing data:", e);
                    localStorage.removeItem('ratedMoviesData'); // Clear bad data
                    setSelf(new Map());
                }
            }

            onSet(newValue => {
                const plainObject: { [key: string]: MovieRating } = {};
                newValue.forEach((value, key) => {
                    plainObject[key] = value;
                });
                localStorage.setItem('ratedMoviesData', JSON.stringify(plainObject));
            });
        },
    ],
});
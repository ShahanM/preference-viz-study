import { atom } from 'recoil';
import { getItem, removeItem, setItem } from '../utils/localStorageUtils';
import { Movie } from '../widgets/moviegrid/moviegriditem/MovieGridItem.types';

export const movieCacheState = atom<Map<string, Movie>>({
	key: 'movieCacheState',
	default: new Map<string, Movie>(),

	// atomEffect for localStorage persistence
	// Note: effects_UNSTABLE is the current stable name for atomEffect in Recoil 0.7+
	effects: [
		({ setSelf, onSet }) => {
			const storedData = getItem('cachedMoviesData');
			if (storedData) {
				try {
					const parsedData: { [key: string]: Movie } = storedData;
					const loadedMap = new Map<string, Movie>(
						Object.values(parsedData).map(movie => [movie.id, movie])
					);
					setSelf(loadedMap);
				} catch (e) {
					console.error("Error parsing rated movies from localStorage, clearing data:", e);
					removeItem('cachedMoviesData'); // Clear bad data
					setSelf(new Map());
				}
			}

			onSet(newValue => {
				const plainObject: { [key: string]: Movie } = {};
				newValue.forEach((value, key) => {
					plainObject[key] = value;
				});
				setItem('cachedMoviesData', plainObject);
			});
		},
	],
});
import { atom } from 'recoil';
import { Movie } from '../widgets/moviegrid/moviegriditem/MovieGridItem.types';

export const movieSelectionState = atom<Movie | null>({
	key: 'movieSelectionState',
	default: null
});

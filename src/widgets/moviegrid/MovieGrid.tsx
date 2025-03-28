import React, { useEffect, useState, useMemo } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';
import { useStudy } from 'rssa-api';
import LoadingText from '../../components/LoadingText';
import { mapKeyContainsAll } from '../../utils/helper';
import './MovieGrid.css';
import MovieGridItem from './moviegriditem/MovieGridItem';
import { Movie, MovieRating } from './moviegriditem/MovieGridItem.types';

interface MovieGridProps {
	movieIds: string[];
	itemsPerPage: number;
	dataCallback: (data: any) => void;
}

interface MovieGridState {
	movieIdCache: string[],
	moviesToFetch: string[],
	loading: boolean
}

type MovieGridAction = 
	| { type: 'SET_MOVIES_TO_FETCH'; payload: string[] }
	| { type: 'SET_MOVIE_ID_CACHE'; payload: string[] }
	| { type: 'SET_LOADING'; payload: boolean };


const MovieGridReduce = (
	state: MovieGridState,
	action: MovieGridAction
): MovieGridState => {
	switch(action.type) {
		case 'SET_MOVIES_TO_FETCH':
			return { ...state, moviesToFetch: action.payload };
		case 'SET_MOVIE_ID_CACHE':
			return { ...state, movieIdCache: action.payload };
		case 'SET_LOADING':
			return { ...state, loading: action.payload };
		default:
			return state;
	}
}


const MovieGrid: React.FC<MovieGridProps> = ({
	movieIds,
	itemsPerPage,
	dataCallback }
) => {

	const initialState: MovieGridState = {
		movieIdCache: movieIds,
		moviesToFetch: [],
		loading: false
	}

	const { studyApi } = useStudy();

	const [currentPage, setCurrentPage] = useState<number>(1);
	const [movieRatingsLookup, setMovieRatingsLookup] = useState<Map<string, MovieRating>>();

	const [movieMap, setMovieMap] = useState<Map<string, Movie>>(new Map<string, Movie>());

	const [state, dispatch] = React.useReducer(MovieGridReduce, initialState);

	const [prevBtnDisabled, setPrevBtnDisabled] = useState<boolean>(true);
	const [nextBtnDisabled, setNextBtnDisabled] = useState<boolean>(true);


	useEffect(() => {
        const startIndex = (currentPage - 1) * itemsPerPage * 2;
        const endIndex = currentPage * itemsPerPage * 2;
        const fetcharr = movieIds.slice(startIndex, endIndex);
        dispatch({ type: 'SET_MOVIES_TO_FETCH', payload: fetcharr });
    }, [movieIds, itemsPerPage, currentPage]);


	useEffect(() => {
		const getMoviesByIDs = async (ids: string[]) => {
			dispatch({ type: 'SET_LOADING', payload: true });
			studyApi.post<string[], Movie[]>('movie/ers', ids)
				.then((newmovies: Movie[]) => {
					let newmovieMap = new Map<string, Movie>(movieMap);
					newmovies.forEach(item => {
						newmovieMap.set(item.id, item);
					});
					setMovieMap(newmovieMap);
					dispatch({ type: 'SET_MOVIES_TO_FETCH', payload: [] });
				})
				.catch((error: any) => {
					console.log(error);
					dispatch({ type: 'SET_LOADING', payload: false });
				}).finally(() => {
					dispatch({ type: 'SET_LOADING', payload: false });
				});
		}
		if (state.moviesToFetch.length > 0 && !mapKeyContainsAll<string>(movieMap, state.moviesToFetch)) {
			getMoviesByIDs(state.moviesToFetch);
		}
	}, [state.moviesToFetch, movieMap, studyApi]);

	const renderPrev = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
		}
	}

	const renderNext = () => {
		const totalMovies = movieMap.size;
        const nextPageIndex = currentPage * itemsPerPage;

        if (nextPageIndex < totalMovies) {
            const startIndex = nextPageIndex;
            const endIndex = startIndex + itemsPerPage * 2;
            const fetcharr = movieIds.slice(startIndex, endIndex);

            dispatch({ type: 'SET_MOVIES_TO_FETCH', payload: fetcharr });
        }
		setCurrentPage(currentPage + 1);
	}

	useEffect(() => {
		setNextBtnDisabled(currentPage * itemsPerPage >= movieMap.size);
		setPrevBtnDisabled(currentPage === 1);
	}, [currentPage, itemsPerPage, movieMap.size])

	const rateMovies = (newRating: number, movieid: string) => {
		let galleryMovies = new Map<string, Movie>(movieMap);
		let ratedMovies = new Map<string, MovieRating>(movieRatingsLookup);

		let ratedMovie = ratedMovies.get(movieid);
		if (ratedMovie) {
			ratedMovie.rating = newRating;
		} else {
			const movie = movieMap.get(movieid);
			if (movie) {
				ratedMovie = {
					id: movie.id,
					movielens_id: movie.movielens_id,
					rating: newRating
				};
			} else { return }
		}

		let ratedMovieData = galleryMovies.get(movieid);
		if (ratedMovieData) {
			ratedMovieData.rating = newRating;
			galleryMovies.set(movieid, ratedMovieData);
			setMovieMap(galleryMovies);
		}

		ratedMovies.set(movieid, ratedMovie);
		setMovieRatingsLookup(ratedMovies);
	}

	useEffect(() => {
		if (movieRatingsLookup) {
			dataCallback([...movieRatingsLookup.values()]);
		}
	}, [movieRatingsLookup, dataCallback])

	const visibleMovies = useMemo(() => {
		return [...movieMap.values()].slice(
			(currentPage - 1) * itemsPerPage,
			currentPage * itemsPerPage
		);
	}, [movieMap, currentPage, itemsPerPage]);

	return (
		<Container className="gallery">
			<Row>
				<div className="grid-container">
					{(currentPage * itemsPerPage <= movieMap.size) ?
						<ul>
							{visibleMovies.map(currentMovie => (
								<MovieGridItem key={"TN_" + currentMovie.id}
									movieItem={currentMovie}
									ratingCallback={rateMovies} />
							))}
						</ul>
						: <div style={{
							minWidth: "918px",
							minHeight: "fit-parent"
						}}>
							<Spinner animation="border" role="status"
								style={{
									margin: "18% 50%",
									width: "54px", height: "54px"
								}} />
						</div>
					}
				</div>
			</Row>
			<Row className="galleryFooter">
				<Col>
					<div className="btnDiv">
						<Button id="gallery-left-btn"
							disabled={prevBtnDisabled}
							variant="ers" onClick={renderPrev}>
							&lt;
						</Button>
					</div>
				</Col>
				<Col>
					<div className="btnDiv">
						<Button id="gallery-right-btn"
							disabled={nextBtnDisabled}
							variant="ers" onClick={renderNext}>
							{nextBtnDisabled && state.loading ?
								<LoadingText text={"Fetching more movies"} />
								: ">"}
						</Button>
					</div>
				</Col>
			</Row>
		</Container>
	);
}


export default MovieGrid;
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';
import { useRecoilState } from 'recoil';
import { useStudy } from 'rssa-api';
import LoadingText from '../../components/LoadingText';
import { movieCacheState } from '../../states/movieCacheState';
import { RETRY_DELAYS_MS } from '../../utils/constants';
import './MovieGrid.css';
import MovieGridItem from './moviegriditem/MovieGridItem';
import { Movie } from './moviegriditem/MovieGridItem.types';

interface MovieGridProps {
	itemsPerPage: number;
	dataCallback: (data: any) => void;
}

const MovieGrid: React.FC<MovieGridProps> = ({
	itemsPerPage,
	dataCallback }
) => {

	const { studyApi } = useStudy();

	const [currentPage, setCurrentPage] = useState<number>(1);
	const [movieMap, setMovieMap] = useRecoilState(movieCacheState);

	const [isLoadingMovies, setIsLoadingMovies] = useState<boolean>(false);
	const [fetchError, setFetchError] = useState<boolean>(false);
	const [retryAttempt, setRetryAttempt] = useState<number>(0);
	const [currentFetchTrigger, setCurrentFetchTrigger] = useState<number>(0);

	const [prevBtnDisabled, setPrevBtnDisabled] = useState<boolean>(true);
	const [nextBtnDisabled, setNextBtnDisabled] = useState<boolean>(true);

	const fetchMovies = useCallback(async () => {
		if (!studyApi.getParticipantId()) {
			console.error("Participant ID is not available in studyApi.");
			return;
		}

		setIsLoadingMovies(true);
		setFetchError(false);

		const offset = movieMap.size;
		const limit = itemsPerPage * 2;

		try {
			const movies: Movie[] = await studyApi.get<Movie[]>(`movies/ers?offset=${offset}&limit=${limit}`);
			setMovieMap(prevMovieMap => {
				const newMovieMap = new Map<string, Movie>(prevMovieMap);
				movies.forEach(item => {
					newMovieMap.set(item.id, item);
				});
				return newMovieMap;
			});
			setRetryAttempt(0);
		} catch (error: any) {
			console.error("Error fetching movies:", error);
			setFetchError(true);
		} finally {
			setIsLoadingMovies(false);
		}
	}, [movieMap, itemsPerPage, studyApi, setMovieMap]);


	useEffect(() => {
		const requiredMoviesForNextPage = (currentPage + 1) * itemsPerPage;
		if (movieMap.size < requiredMoviesForNextPage && !isLoadingMovies && !fetchError) {
			fetchMovies();
		}

	}, [movieMap, itemsPerPage, currentPage, isLoadingMovies, fetchError, fetchMovies, currentFetchTrigger]);

	useEffect(() => {
		if (fetchError && !isLoadingMovies) {
			const nextDelay = RETRY_DELAYS_MS[retryAttempt];

			if (nextDelay !== undefined) {
				console.log(`Retrying fetch in ${nextDelay / 1000} seconds... (Attempt ${retryAttempt + 1})`);
				const timerId = setTimeout(() => {
					setRetryAttempt(prev => prev + 1);
					setCurrentFetchTrigger(prev => prev + 1);
				}, nextDelay);

				return () => clearTimeout(timerId);
			} else {
				console.warn("Max retry attempts reached. Please refresh to try again.");
			}
		}
	}, [fetchError, isLoadingMovies, retryAttempt]);

	const renderPrev = useCallback(() => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
			setRetryAttempt(0);
		}
	}, [currentPage]);

	const renderNext = useCallback(() => {
		setCurrentPage(currentPage + 1);
		setRetryAttempt(0);
	}, [currentPage]);

	useEffect(() => {
		const hasMoreMoviesToLoad = movieMap.size < (currentPage + 1) * itemsPerPage;
		const maxRetriesReached = fetchError && RETRY_DELAYS_MS[retryAttempt] === undefined;

		setNextBtnDisabled(
			(isLoadingMovies && hasMoreMoviesToLoad) ||
			(currentPage * itemsPerPage >= movieMap.size && !isLoadingMovies && !fetchError) ||
			maxRetriesReached
		);
		setPrevBtnDisabled(currentPage === 1);
	}, [currentPage, itemsPerPage, movieMap.size, isLoadingMovies, fetchError, retryAttempt]);


	const rateMovies = useCallback((newRating: number, movieid: string) => {
		setMovieMap(prevMovieMap => {
			const newGalleryMovies = new Map<string, Movie>(prevMovieMap);
			const ratedMovieData = newGalleryMovies.get(movieid);
			if (ratedMovieData) {
				ratedMovieData.rating = newRating;
				newGalleryMovies.set(movieid, ratedMovieData);
			}
			return newGalleryMovies;
		});

		const movieObj = movieMap.get(movieid);
		if (!movieObj) {
			console.warn(`Movie with id ${movieid} not found in movieMap.`);
			return;
		}

		const newRatingObj = {
			id: movieObj.id,
			movielens_id: movieObj.movielens_id,
			rating: newRating
		}

		dataCallback(newRatingObj);
	}, [movieMap, dataCallback, setMovieMap]);

	const visibleMovies = useMemo(() => {
		return [...movieMap.values()].slice(
			(currentPage - 1) * itemsPerPage,
			currentPage * itemsPerPage
		);
	}, [movieMap, currentPage, itemsPerPage]);
	const hasContentOnCurrentPage = visibleMovies.length > 0;
	return (
		<Container className="gallery rounded pt-3 pb-3">
			<Row>
				<div className="grid-container">
					{isLoadingMovies && !hasContentOnCurrentPage ? (
						<div style={{
							minWidth: "918px",
							minHeight: "fit-parent",
							display: "flex",
							justifyContent: "center",
							alignItems: "center"
						}}>
							<Spinner animation="border" role="status"
								style={{
									width: "54px", height: "54px"
								}} />
						</div>
					) : (
						hasContentOnCurrentPage ? (
							<ul className="ps-0">
								{visibleMovies.map(currentMovie => (
									<MovieGridItem key={"TN_" + currentMovie.id}
										movieItem={currentMovie}
										ratingCallback={rateMovies} />
								))}
							</ul>
						) : (
							<div>No movies to display.</div>
						)
					)}
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
							{isLoadingMovies && nextBtnDisabled ?
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
import React, { useEffect, useState } from 'react';
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

const MovieGrid: React.FC<MovieGridProps> = ({
	movieIds,
	itemsPerPage,
	dataCallback }
) => {

	const { studyApi } = useStudy();

	const [currentPage, setCurrentPage] = useState<number>(1);
	const [movieRatingsLookup, setMovieRatingsLookup] = useState<Map<string, MovieRating>>();

	const [movieMap, setMovieMap] = useState<Map<string, Movie>>(new Map<string, Movie>());


	const [loading, setLoading] = useState<boolean>(false);
	const [movieIdCache, setMovieIdCache] = useState<string[]>(movieIds);
	const [moviesToFetch, setMoviesToFetch] = useState<string[]>([]);

	const [prevBtnDisabled, setPrevBtnDisabled] = useState<boolean>(true);
	const [nextBtnDisabled, setNextBtnDisabled] = useState<boolean>(true);

	const updateMoviePageData = (unfetchIds: string[], numItems: number) => {
		const limit = numItems * 2 // FIXME hardcoded values
		let moviearr = [...unfetchIds];
		let fetcharr = moviearr.splice(0, limit);

		setMovieIdCache(moviearr);
		setMoviesToFetch(fetcharr);
	}

	useEffect(() => {
		updateMoviePageData(movieIds, itemsPerPage);
	}, [movieIds, itemsPerPage])

	const updateCurrentPage = (page: number) => {
		setCurrentPage(page);
	}

	useEffect(() => {
		const getMoviesByIDs = async (ids: string[]) => {
			setLoading(true);
			studyApi.post<string[], Movie[]>('movie/ers', ids)
				.then((newmovies: Movie[]) => {
					let newmovieMap = new Map<string, Movie>(movieMap);
					newmovies.forEach(item => {
						newmovieMap.set(item.id, item);
					});
					setMovieMap(newmovieMap);
					setMoviesToFetch([]);
				})
				.catch((error: any) => console.log(error));
		}
		if (moviesToFetch.length > 0 && !mapKeyContainsAll<string>(movieMap, moviesToFetch)) {
			getMoviesByIDs(moviesToFetch);
		}
	}, [moviesToFetch, movieMap, studyApi]);

	const renderPrev = () => {
		if (currentPage > 1) {
			updateCurrentPage(currentPage - 1)
			setCurrentPage(currentPage - 1);
		}
	}

	const renderNext = () => {
		if (currentPage * itemsPerPage < movieMap.size) {
			updateMoviePageData(movieIdCache, 24);
		}
		updateCurrentPage(currentPage + 1);
		setCurrentPage(currentPage + 1);
	}

	useEffect(() => {
		setNextBtnDisabled(currentPage * itemsPerPage >= movieMap.size);
		setPrevBtnDisabled(currentPage === 1);
	}, [currentPage, itemsPerPage, movieMap.size])

	useEffect(() => { setLoading(false); }, [movieMap])

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

	return (
		<Container className="gallery">
			<Row>
				<div className="grid-container">
					{(currentPage * itemsPerPage <= movieMap.size) ?
						<ul>
							{[...movieMap.values()].slice((currentPage - 1) * itemsPerPage,
								currentPage * itemsPerPage)
								.map(currentMovie => (
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
							{nextBtnDisabled && loading ?
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
import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';
import StarRatings from 'react-star-ratings';
import { imgurl, post } from '../../middleware/requests';
import './MovieGrid.css';
import MovieGridItem from './moviegriditem/MovieGridItem';
import { Movie, MovieRating } from './moviegriditem/MovieGridItem.types';
import LoadingText from '../../components/LoadingText';
import { mapKeyContainsAll } from '../../utils/helper';

interface MovieGridProps {
	movieIds: number[];
	itemsPerPage: number;
	dataCallback: (data: any) => void;
}

// export default function MovieGrid({ movieIds, itemsPerPage,
// 	dataCallback }) {

const MovieGrid: React.FC<MovieGridProps> = ({
	movieIds,
	itemsPerPage,
	dataCallback }
) => {

	// const [maxlength, setMaxlength] = useState(0);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [movieRatingsLookup, setMovieRatingsLookup] = useState<Map<number, MovieRating>>();
	// const [ratedMovies, setRatedMovies] = useState<Movie[]>([]);

	// const [movies, setMovies] = useState<Movie[]>([]);

	// FIXME: see if we can use a Map instead of an array since we have to 
	// perform a lookup each time we rate a movie.
	const [movieMap, setMovieMap] = useState<Map<number, Movie>>(new Map<number, Movie>());


	const [loading, setLoading] = useState<boolean>(false);
	const [movieIdCache, setMovieIdCache] = useState<number[]>(movieIds);
	const [moviesToFetch, setMoviesToFetch] = useState<number[]>([]);

	const [prevBtnDisabled, setPrevBtnDisabled] = useState<boolean>(true);
	const [nextBtnDisabled, setNextBtnDisabled] = useState<boolean>(true);


	// FIXME: we do not need this anymore because the API response is already shuffled
	// We just need to paginate the response.
	const pickRandomMovies = (unfetchedIds: number[], numItems: number) => {
		// const limit = itemsPerPage * 2;
		const limit = numItems * 2 // FIXME hardcoded values
		let randomMovies = [];
		let moviearr = [...unfetchedIds];
		for (let i = 0; i < limit; i++) {
			let randomMovie = moviearr.splice(Math.floor(Math.random()
				* moviearr.length), 1);
			randomMovies.push(...randomMovie);
		}
		setMovieIdCache(moviearr);
		setMoviesToFetch(randomMovies);
	}

	const updateMoviePageData = (unfetchIds: number[], numItems: number) => {
		// const limit = itemsPerPage * 2;
		const limit = numItems * 2 // FIXME hardcoded values
		let moviearr = [...unfetchIds];
		let fetcharr = moviearr.splice(0, limit);

		setMovieIdCache(moviearr);
		setMoviesToFetch(fetcharr);
	}

	useEffect(() => {
		// pickRandomMovies(movieIds);
		updateMoviePageData(movieIds, itemsPerPage);
	}, [movieIds, itemsPerPage])

	const updateCurrentPage = (page: number) => {
		// const currentpage = currentPage;
		// let action = 'next';
		// if (currentpage > page) {
		// 	action = 'prev';
		// }
		setCurrentPage(page);
	}


	// useEffect(() => {
	// 	const getAllMovieIds = async () => {
	// 		get('ers/movies/ids/')
	// 			.then((response): Promise<movie[]> => response.json())
	// 			.then((newmovies: movie[]) => {
	// 				console.log("fetched all movie ids", newmovies);
	// 				setMovieIds(newmovies);

	// 			})
	// 			.catch((error) => console.log(error));
	// 	}
	// 	getAllMovieIds();
	// }, []);

	useEffect(() => {
		const getMoviesByIDs = async (ids: number[]) => {
			console.log("MovieGrid getMoviesByIDs", ids);
			setLoading(true);
			post('api/v2/movie/ers', ids)
				.then((response): Promise<Movie[]> => response.json())
				.then((newmovies: Movie[]) => {
					console.log(newmovies);
					let newmovieMap = new Map<number, Movie>(movieMap);
					newmovies.forEach(item => {
						newmovieMap.set(item.movie_id, item);
					});
					setMovieMap(newmovieMap);
					setMoviesToFetch([]);
					// setMovies((prevMovies) => [...prevMovies, ...newmovies]);
				})
				.catch((error) => console.log(error));
		}
		// if (moviesToFetch.length > 0 && !mapKeyContainsAll(movieMap, moviesToFetch)) {
			// console.log("We have to fetch data");
		// }
		console.log("MovieGrid useEffect", !mapKeyContainsAll(movieMap, moviesToFetch));
		console.log("MovieGrid useEffect", moviesToFetch, movieMap);
		if (moviesToFetch.length > 0 && !mapKeyContainsAll(movieMap, moviesToFetch)) {
			console.log("We have to fetch data");
			getMoviesByIDs(moviesToFetch);
		}
	}, [moviesToFetch, movieMap]);

	// useEffect(() => {
	// 	setMaxlength(movies.length);
	// }, [movies])

	const renderPrev = () => {
		if (currentPage > 1) {
			// if (pagingCallback) {
			// 	pagingCallback(currentPage - 1);
			// }
			updateCurrentPage(currentPage - 1)
			setCurrentPage(currentPage - 1);
		}
	}

	const renderNext = () => {
		if (currentPage * itemsPerPage < movieMap.size) {
			// pickRandomMovies(movieIdCache);
			updateMoviePageData(movieIdCache, 24);
		}
		// if (pagingCallback) {
		// 	pagingCallback(currentPage + 1);
		// }
		updateCurrentPage(currentPage + 1);
		setCurrentPage(currentPage + 1);
	}

	useEffect(() => {
		setNextBtnDisabled(currentPage * itemsPerPage >= movieMap.size);
		setPrevBtnDisabled(currentPage === 1);
	}, [currentPage, itemsPerPage, movieMap.size])

	useEffect(() => { setLoading(false); }, [movieMap])

	const rateMovies = (newRating: number, movieid: number) => {
		console.log("MovieGrid rateMovies", newRating, movieid);

		let galleryMovies = new Map<number, Movie>(movieMap);
		let ratedMovies = new Map<number, MovieRating>(movieRatingsLookup);

		let ratedMovie = ratedMovies.get(movieid);
		if (ratedMovie) {
			ratedMovie.rating = newRating;
		} else {
			ratedMovie = { movie_id: movieid, rating: newRating };
		}

		let ratedMovieData = galleryMovies.get(movieid);
		if (ratedMovieData) {
			ratedMovieData.rating = newRating;
			galleryMovies.set(movieid, ratedMovieData);
			setMovieMap(galleryMovies);
		}

		ratedMovies.set(movieid, ratedMovie);
		setMovieRatingsLookup(ratedMovies);

		// let updatedMovie = galleryMovies.find(item =>
		// 	item.movie_id === movieid);
		// if (updatedMovie) {
		// 	updatedMovie.rating = newRating;
		// }

		// setMovies(galleryMovies);

		// FIXME: Make this a O(1) operation
		// const isNew = ratedMoviesData.some(item =>
		// item.movie_id === movieid);


		// console.log("isNew", isNew);

		// let newrefMovies = [...movies];
		// let newrefRatedMovies = [...ratedMovies];
		// let newrefRatedMoviesData = [...ratedMoviesData];

		// let updatedmovie = newrefMovies.find(item =>
		// 	item.movie_id === movieid);
		// if (!updatedmovie) {
		// 	return;
		// }
		// updatedmovie.rating = newRating;
		// if (isNew) {
		// 	let updatevisited = [...ratedMoviesData, {
		// 		movie_id: movieid, rating: newRating
		// 	}];
		// 	let updaterated = [...ratedMovies, updatedmovie];
		// 	setRatedMovies(updaterated);
		// 	setRatedMoviesData(updatevisited);
		// 	// setRatedMovieCount(updatevisited.length);
		// 	// setButtonDisabled(updatevisited.length < 10);
		// } else {
		// 	let updatevisited = newrefRatedMoviesData.find(item =>
		// 		item.movie_id === movieid);
		// 	if (!updatevisited) {
		// 		return;
		// 	}
		// 	updatevisited.rating = newRating;

		// 	let updaterated = newrefRatedMovies.find(item =>
		// 		item.movie_id === movieid);
		// 	if (!updaterated) {
		// 		return;
		// 	}
		// 	updaterated.rating = newRating;
		// 	setRatedMovies(newrefRatedMovies);
		// 	setRatedMoviesData(newrefRatedMoviesData);
		// }
		// setMovies(newrefMovies);
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
									<MovieGridItem key={"TN_" + currentMovie.movie_id}
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
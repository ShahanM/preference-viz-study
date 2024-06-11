import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';
import StarRatings from 'react-star-ratings';
import { imgurl, post } from '../middleware/requests';
import '../styles/moviegrid.css';


export default function MovieGrid({ movieIds, itemsPerPage,
	dataCallback }) {

	// const [maxlength, setMaxlength] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	const [ratedMoviesData, setRatedMoviesData] = useState([]);
	const [ratedMovies, setRatedMovies] = useState([]);
	const [movies, setMovies] = useState([]);
	const [loading, setLoading] = useState(false);
	const [movieIdCache, setMovieIdCache] = useState(movieIds);
	const [moviesToFetch, setMoviesToFetch] = useState([]);

	const pickRandomMovies = (unfetchedIds) => {
		// const limit = itemsPerPage * 2;
		const limit = 24 * 2 // FIXME hardecoded values
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

	useEffect(() => {
		pickRandomMovies(movieIds);
	}, [movieIds])

	const updateCurrentPage = (page) => {
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
		const getMoviesByIDs = async (ids) => {
			console.log(ids);
			post('ers/movies/', ids)
				.then((response): Promise<movie[]> => response.json())
				.then((newmovies: movie[]) => {
					console.log(newmovies);
					setMovies((prevMovies) => [...prevMovies, ...newmovies]);
				})
				.catch((error) => console.log(error));
		}
		getMoviesByIDs(moviesToFetch);
	}, [moviesToFetch]);

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
		if (currentPage * itemsPerPage < movies.length) {
			pickRandomMovies(movieIdCache);
		}
		// if (pagingCallback) {
		// 	pagingCallback(currentPage + 1);
		// }
		updateCurrentPage(currentPage + 1);
		setCurrentPage(currentPage + 1);
	}

	const rateMovies = (newRating, idstr) => {
		const movieid = parseInt(idstr);
		const isNew = !ratedMoviesData.some(item =>
			item.item_id === movieid);

		let newrefMovies = [...movies];
		let newrefRatedMovies = [...ratedMovies];
		let newrefRatedMoviesData = [...ratedMoviesData];

		let updatedmovie = newrefMovies.find(item =>
			item.movie_id === movieid);
		updatedmovie.rating = newRating;
		if (isNew) {
			let updatevisited = [...ratedMoviesData, {
				item_id: movieid, rating: newRating
			}];
			let updaterated = [...ratedMovies, updatedmovie];
			setRatedMovies(updaterated);
			setRatedMoviesData(updatevisited);
			// setRatedMovieCount(updatevisited.length);
			// setButtonDisabled(updatevisited.length < 10);
		} else {
			let updatevisited = newrefRatedMoviesData.find(item =>
				item.item_id === movieid);
			updatevisited.rating = newRating;

			let updaterated = newrefRatedMovies.find(item =>
				item.movie_id === movieid);
			updaterated.rating = newRating;
			setRatedMovies(newrefRatedMovies);
			setRatedMoviesData(newrefRatedMoviesData);
		}
		setMovies(newrefMovies);
	}

	useEffect(() => {
		dataCallback(ratedMoviesData);
	}, [ratedMoviesData])

	return (
		<Container className="gallery">
			<Row>
				<div className="grid-container">
					{(currentPage * itemsPerPage <= movies.length) ?
						<>
							{movies.slice((currentPage - 1) * itemsPerPage,
								currentPage * itemsPerPage)
								.map(currentMovie => (
									<MovieGridItem key={"TN_" + currentMovie.id}
										movieItem={currentMovie}
										handleRating={rateMovies} />
								))}
						</>
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
							disabled={currentPage === 1}
							variant="ers" onClick={renderPrev}>
							&lt;
						</Button>
					</div>
				</Col>
				<Col>
					<div className="btnDiv">
						<Button id="gallery-right-btn"
							disabled={currentPage * itemsPerPage === movies.length}
							variant="ers" onClick={renderNext}>
							&gt;
						</Button>
					</div>
				</Col>
			</Row>
		</Container>
	);
}


export const MovieGridItem = ({ movieItem, handleRating }) => {

	const poster_identifier = movieItem.poster_identifier;
	const rated = movieItem.rating !== undefined;

	return (
		<div id={"TN_" + movieItem.movie_id}
			className={"grid-item"} style={{
				backgroundImage: `url(${imgurl(poster_identifier)}), url(${imgurl(null)})`,
				backgroundColor: "rgb(249, 176, 92, 0.6)"
			}}>
			<div className={rated ? "rated overlay" : "overlay"}>
				<div className={movieItem.rating > 0 ? 'star-div-rated' : 'star-div'}>
					<StarRatings
						rating={movieItem.rating}
						starRatedColor="rgb(252,229,65)"
						starHoverColor="rgb(252,229,65)"
						starDimension="18px"
						starSpacing="1px"
						changeRating={handleRating}
						numberOfStars={5}
						name={movieItem.movie_id.toString()} />
				</div>
			</div>
			<div className="grid-item-label" style={{ position: "absolute" }}>
				{movieItem.title + " (" + movieItem.year + ")"}
			</div>
		</div>
	);
}
import React, { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import { useLocation, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { get } from '../middleware/requests';
import { CurrentStep, StudyStep } from '../rssa-api/RssaApi.types';
import { useStudy } from '../rssa-api/StudyProvider';
import MovieGrid from '../widgets/moviegrid/MovieGrid';
import { MovieRating } from '../widgets/moviegrid/moviegriditem/MovieGridItem.types';
import { StudyPageProps } from './StudyPage.types';


const MovieRatingPage: React.FC<StudyPageProps> = ({
	next,
	checkpointUrl,
	participant,
	studyStep,
	updateCallback
}) => {
	const itemsPerPage = 24;
	const minRatingCount = 10;

	const { studyApi } = useStudy();
	const navigate = useNavigate();
	const location = useLocation();

	const [isUpdated, setIsUpdated] = useState<boolean>(false);
	const [buttonDisabled, setButtonDisabled] = useState(true);
	const [loading, setLoading] = useState(false);

	const [movieIds, setMovieIds] = useState<number[]>([]);
	const [ratedMovies, setRatedMovies] = useState<MovieRating[]>([]);


	useEffect(() => {
		if (checkpointUrl !== '/' && checkpointUrl !== location.pathname) {
			navigate(checkpointUrl);
		}
	}, [checkpointUrl, location.pathname, navigate]);

	useEffect(() => {
		if (isUpdated) {
			localStorage.setItem('ratedMoviesData', JSON.stringify(ratedMovies));
			navigate(next, { state: { ratedMovies: ratedMovies } });
		}
	}, [isUpdated, navigate, next, ratedMovies]);

	const handleNextBtn = () => {
		console.log("MovieRatingPage stepID", participant.current_step);
		studyApi.post<CurrentStep, StudyStep>('studystep/next', {
			current_step_id: participant.current_step
		}).then((nextStep) => {
			localStorage.setItem('ratedMoviesData', JSON.stringify(ratedMovies));
			updateCallback(nextStep, next)
			setIsUpdated(true);
		});
	}

	useEffect(() => {
		// TODO: Move this to a recommender api hook
		const getAllMovieIds = async () => {
			setLoading(true);
			return get('api/v2/movie/ids/ers')
				.then((response): Promise<number[]> => response.json())
				.then((newmovies: number[]) => {
					localStorage.setItem('allMovieIds', JSON.stringify(newmovies));
					setMovieIds(newmovies);
					setLoading(false);
				})
				.catch((error) => {
					console.log(error);
					return [];
				});
		}

		if (localStorage.getItem('allMovieIds')) {
			const allmovieIds = JSON.parse(localStorage.getItem('allMovieIds') || '[]');
			setMovieIds(allmovieIds);
		} else {
			getAllMovieIds();
		}
	}, []);


	useEffect(() => {
		setButtonDisabled(ratedMovies.length < minRatingCount);
	}, [ratedMovies])

	return (
		<Container>
			<Row>
				<Header title={studyStep?.name} content={studyStep?.description} />
			</Row>
			<Row>
				<MovieGrid
					dataCallback={setRatedMovies}
					movieIds={movieIds}
					itemsPerPage={itemsPerPage} />
			</Row>
			<Row>
				<RankHolder count={ratedMovies.length} max={minRatingCount} />
				<Footer callback={handleNextBtn} disabled={buttonDisabled && !loading} />
			</Row>
		</Container>
	);
}


interface RankHolderProps {
	count: number;
	max: number;
}


const RankHolder: React.FC<RankHolderProps> = ({ count, max }) => {
	console.log("RankHolder: count", count);
	return (
		<div className="rankHolder">
			<span> Ranked Movies: </span>
			<span><i>{count}</i></span>
			<span><i>of {max}</i></span>
		</div>
	)
}

export default MovieRatingPage;
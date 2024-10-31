import React, { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import { useLocation, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { useStudy, CurrentStep, StudyStep } from 'rssa-api';
import MovieGrid from '../widgets/moviegrid/MovieGrid';
import { MovieRating } from '../widgets/moviegrid/moviegriditem/MovieGridItem.types';
import { StudyPageProps } from './StudyPage.types';


const MovieRatingPage: React.FC<StudyPageProps> = ({
	next,
	checkpointUrl,
	participant,
	studyStep,
	updateCallback,
	sizeWarning
}) => {
	const itemsPerPage = 24;
	const minRatingCount = 10;

	const { studyApi } = useStudy();
	const navigate = useNavigate();
	const location = useLocation();

	const [isUpdated, setIsUpdated] = useState<boolean>(false);
	const [buttonDisabled, setButtonDisabled] = useState(true);
	const [loading, setLoading] = useState(false);

	const [movieIds, setMovieIds] = useState<string[]>([]);
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
		setLoading(true);
		setButtonDisabled(true);
		studyApi.post<CurrentStep, StudyStep>('studystep/next', {
			current_step_id: participant.current_step
		}).then((nextStep: StudyStep) => {
			localStorage.setItem('ratedMoviesData', JSON.stringify(ratedMovies));
			updateCallback(nextStep, next)
			setIsUpdated(true);
		});
	}

	useEffect(() => {
		const getAllMovieIds = async () => {
			return studyApi.get<string[]>('movie/ids/ers')
				.then((newmovies: string[]) => {
					localStorage.setItem('allMovieIds', JSON.stringify(newmovies));
					setMovieIds(newmovies);
				})
				.catch((error: any) => {
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
	}, [studyApi]);


	useEffect(() => {
		setButtonDisabled(ratedMovies.length < minRatingCount);
	}, [ratedMovies])

	return (
		<Container>
			<Row>
				<Header title={studyStep?.name} content={studyStep?.description} />
			</Row>
			{sizeWarning ? <Row className="size-error-overlay">Nothing to display</Row> :
				<Row>
					<MovieGrid
						dataCallback={setRatedMovies}
						movieIds={movieIds}
						itemsPerPage={itemsPerPage} />
				</Row>
			}
			<Row>
				<RankHolder count={ratedMovies.length} max={minRatingCount} />
				<Footer callback={handleNextBtn} disabled={buttonDisabled}
					loading={loading} />
			</Row>
		</Container>
	);
}


interface RankHolderProps {
	count: number;
	max: number;
}


const RankHolder: React.FC<RankHolderProps> = ({ count, max }) => {
	return (
		<div className="rankHolder">
			<span>Rated Movies: </span>
			<span><i>{count}</i></span>
			<span><i>of {max}</i></span>
		</div>
	)
}

export default MovieRatingPage;
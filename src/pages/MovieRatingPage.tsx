import React, { useCallback, useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { CurrentStep, Participant, StudyStep, useStudy } from 'rssa-api';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { participantState, studyStepState } from '../state/studyState';
import MovieGrid from '../widgets/moviegrid/MovieGrid';
import { MovieRating } from '../widgets/moviegrid/moviegriditem/MovieGridItem.types';
import { StudyPageProps } from './StudyPage.types';


const MovieRatingPage: React.FC<StudyPageProps> = ({
	next,
	checkpointUrl,
	updateCallback,
	sizeWarning
}) => {
	const itemsPerPage = 24;
	const minRatingCount = 10;

	const participant: Participant | null = useRecoilValue(participantState);
	const studyStep: StudyStep | null = useRecoilValue(studyStepState);

	const { studyApi } = useStudy();
	const navigate = useNavigate();
	const location = useLocation();

	const [buttonDisabled, setButtonDisabled] = useState(true);
	const [loading, setLoading] = useState(false);
	const [ratedMovies, setRatedMovies] = useState<MovieRating[]>([]);


	useEffect(() => {
		if (checkpointUrl !== '/' && checkpointUrl !== location.pathname) {
			navigate(checkpointUrl);
		}
	}, [checkpointUrl, location.pathname, navigate]);

	const handleNextBtn = useCallback(async () => {
		if (!participant || !studyStep) {
			console.error("Participant or study step is not defined.");
			return;
		}
		if (ratedMovies.length < minRatingCount) {
			console.warn(`Please rate at least ${minRatingCount} movies.`);
			// TODO: Show a toast or alert to inform the user
			return;
		}

		setLoading(true);
		setButtonDisabled(true);

		try {
			const nextRouteStep: StudyStep = await studyApi.post<CurrentStep, StudyStep>('study/step/next', {
				current_step_id: participant.current_step
			});

			updateCallback(nextRouteStep, participant, next);
			localStorage.setItem('ratedMoviesData', JSON.stringify(ratedMovies));

			navigate(next, { state: { ratedMovies: ratedMovies } });
		} catch (error) {
			console.error("Error getting next step:", error);
		} finally {
			setLoading(false);
		}
	}, [studyApi, participant, studyStep, updateCallback, next, ratedMovies, minRatingCount, navigate]);

	useEffect(() => {
		setButtonDisabled(ratedMovies.length < minRatingCount || !participant || !studyStep);
	}, [ratedMovies, minRatingCount, participant, studyStep]);

	if (!participant || !studyStep) {
		return <div>Loading study data...</div>;
	}

	return (
		<Container>
			<Row>
				<Header title={studyStep?.name} content={studyStep?.description} />
			</Row>
			{sizeWarning ? <Row className="size-error-overlay">Nothing to display</Row> :
				<Row>
					<MovieGrid
						dataCallback={setRatedMovies}
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
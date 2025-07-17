import { useEffect, useRef, useState } from "react";
import { Form, FormSelect, InputGroup } from "react-bootstrap";
import Button from 'react-bootstrap/Button';
import Container from "react-bootstrap/Container";
import FormLabel from "react-bootstrap/FormLabel";
import Row from "react-bootstrap/Row";
import { Link, Outlet, useLocation } from "react-router-dom";
import { post } from "../marked_for_deletion/requests";

const vizTypes = {
	"explicit": "Explicit Visualization",
	"implicit": "Implicit Visualization"
}

const defaultMetadata = {
	num_rec: 40,
	algo: "fishnet + single_linkage",
	randomize: false,
	init_sample_size: 500,
	min_rating_count: 50
}

export default function VisualizationLayout() {

	const { state } = useLocation();
	const { ratings } = state;
	const { type } = state;

	const [items, setItems] = useState([]);
	const [movies, setMovies] = useState({});

	const [inMetadata, setInMetadata] = useState(defaultMetadata);
	const [recMetadata, setRecMetadata] = useState({});

	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const getRecommendations = async () => {
			setLoading(true);
			post("prefviz/recommendation/", {
				user_id: 0, // TODO: change this to the actual user id
				user_condition: 0, // TODO: change this to the actual user condition
				ratings: ratings,
				num_rec: inMetadata.num_rec,
				algo: inMetadata.algo,
				randomize: inMetadata.randomize,
				init_sample_size: inMetadata.init_sample_size,
				min_rating_count: inMetadata.min_rating_count
			}).then((response: Promise<PrefItem[]>) => response.json())
				.then((responseItems: PrefItem[]) => {
					setItems(responseItems.recommendations);
					setRecMetadata(responseItems.metadata);
					setLoading(false);
				}).catch((err) => {
					console.log("VisualizationLayout Error", err);
				});
		}
		getRecommendations();

	}, [ratings, inMetadata])

	useEffect(() => {
		const getMoviesByIDs = async (imap) => {
			post('ers/movies/', Object.keys(imap))
				.then((response): Promise<movie[]> => response.json())
				.then((movies: movie[]) => {
					const moviemap = movies.reduce((map, movie) => {
						map[movie.movie_id] = {
							...movie,
							...imap[movie.movie_id]
						};
						return map;
					}, {});
					setMovies(moviemap);
				})
				.catch((error) => console.log(error));
		}
		// Collect all item_ids and fetch their data
		// Create a map of item_id to movie data so we can augment the 
		// movie info once we get i
		if (items.length > 0) {
			let item_map = {};
			for (let item of items) {
				item_map[item.item_id] = {
					community_score: item.community_score,
					user_score: item.user_score,
					cluster: item.cluster
				};
			}
			getMoviesByIDs(item_map);
		}
	}, [items])

	useEffect(() => {
		if (Object.keys(movies).length > 0 && items.length > 0) {
			if (Object.keys(movies).length === items.length) {
				const moviekeys = new Set(Object.keys(movies));
				const itemkeys = new Set(items.map((item) => item.item_id));

				if (moviekeys !== itemkeys) {
					console.debug("VisualizationLayout", "Mismatch between movies and items");
				}
			} else {
				console.debug("VisualizationLayout", "Mismatch between movies and items");
			}
		}
	}, [items, movies])

	return (
		<>
			{/* <Container style={{
				marginLeft: "3px", marginTop: "180px", position: "absolute", width: "400px",
				border: "1px solid black", borderRadius: "0.5em", backgroundColor: "lightgrey"
			}}>
			</Container> */}
			<Container>
				<Row className="header-row">
					<h1>{vizTypes[type]}</h1>
				</Row>
				<Row className="content-row">
					<AlgorithmForm inMetadata={inMetadata} setInMetadata={setInMetadata} loading={loading} />
				</Row>
				<Row className="content-row">
					<Outlet context={{ movies: movies }} />
				</Row>
				<Row className="footer-row">
					<Link to="/surveypage">
						<Button type="button"
							className="btn btn-primary btn-light float-right">
							Next Page
						</Button>
					</Link>
				</Row>
			</Container>
		</>
	)
}

function AlgorithmForm({ inMetadata, setInMetadata, loading }) {
	const numRef = useRef(null);
	const [inBuffer, setInBuffer] = useState(inMetadata);

	return (
		<Form.Group style={{ margin: "1em auto" }}>
			<Form.Label>Recommendation Settings</Form.Label>
			<InputGroup className="mb-3">
				<InputGroup.Text id="input-num">Number of recommendations:</InputGroup.Text>
				<Form.Control
					ref={numRef}
					aria-label="Number of recommendation"
					aria-describedby="input-num"
					type="number"
					defaultValue={inMetadata.num_rec}
					onChange={(evt) => setInBuffer({
						...inBuffer,
						num_rec: parseInt(evt.target.value)
					})}
				/>
			</InputGroup>
			{/* <InputGroup className="mb-3"> */}
			{/* <InputGroup.Text id="input-method">Diversification method:</InputGroup.Text> */}
			<FormLabel style={{ color: "black" }} id="input-method">Diversification method:</FormLabel>
			<FormSelect
				style={{ marginBottom: "1em" }}
				aria-label="Select diversification method"
				defaultValue="fishnet + single_linkage"
				onChange={(evt) => setInBuffer({
					...inBuffer,
					algo: evt.target.value
				})}>
				<option value="fishnet">Fishnet</option>
				<option value="single_linkage">Single Linkage</option>
				<option value="random">Random Sampling</option>
				<option value="fishnet + single_linkage">Fishnet + Single Linkage</option>
			</FormSelect>
			{/* </InputGroup> */}
			{["fishnet", "random", undefined].includes(inMetadata.algo) ? <></> :
				<InputGroup className="mb-3">
					<InputGroup.Text id="input-init-sample">Initial sample size:</InputGroup.Text>
					<Form.Control
						aria-label="Initial sample size"
						aria-describedby="input-init-sample"
						type="number"
						defaultValue={500}
						onChange={(evt) => setInBuffer({
							...inBuffer,
							init_sample_size: parseInt(evt.target.value)
						})}
					/>
				</InputGroup>
			}
			<InputGroup className="mb-3">
				<InputGroup.Text id="input-min-rating-count">Minimum rating count:</InputGroup.Text>
				<Form.Control
					aria-label="Minimum rating count"
					aria-describedby="input-min-rating-count"
					type="number"
					defaultValue={50}
					onChange={(evt) => setInBuffer({
						...inBuffer,
						min_rating_count: parseInt(evt.target.value)
					})}
				/>
			</InputGroup>
			<Button disabled={loading} onClick={() =>
				setInMetadata(inBuffer)}>
				Update
			</Button>
		</Form.Group>
	)
}
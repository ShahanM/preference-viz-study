import StarRatings from 'react-star-ratings';
import { imgurl, post } from '../../../middleware/requests';
import { MovieGridItemProps } from './MovieGridItem.types';
import './MovieGridItem.css';
import { Image } from 'react-bootstrap';

const MovieGridItem: React.FC<MovieGridItemProps> = ({
	movieItem,
	ratingCallback
}) => {
	const poster_identifier = movieItem.poster_identifier;
	movieItem.rating = movieItem.rating || 0;

	const handleRating = (newRating: number) => {
		ratingCallback(newRating, movieItem.movie_id);
	}

	return (
		<li id={"TN_" + movieItem.movie_id}
			className={"grid-item"}>
			<Image className="grid-item-image" height="200px" width="140px"
				// src={movieItem.poster} 
				src={imgurl(poster_identifier)}
				alt={movieItem.title}
				onError={(evt) => {
					evt.currentTarget.src = "https://rssa.recsys.dev/movie/poster/default_movie_icon.svg"
				}} />
			<div className={movieItem.rating > 0 ? "rated overlay" : "overlay"}>
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
			<div className="grid-item-label">
				{movieItem.title + " (" + movieItem.year + ")"}
			</div>
		</li>
	);
}

export default MovieGridItem;
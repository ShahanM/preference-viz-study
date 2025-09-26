import { useEffect, useState } from 'react';
import { useMovieSelection } from '../../hooks/useMovieSelection';
import type { PreferenceVizRecommendedItem } from '../../types/preferenceVisualization.types';

const RightInfoPanel = ({
    likeCutoff,
    dislikeCutoff,
    showLikeDislikeByLine,
}: {
    likeCutoff: number;
    dislikeCutoff: number;
    showLikeDislikeByLine: boolean;
}) => {
    const [ratingSummary, setRatingSummary] = useState('');
    const { selectedMovie } = useMovieSelection<PreferenceVizRecommendedItem>();

    useEffect(() => {
        if (!selectedMovie) {
            setRatingSummary('Select a movie to see details.');
            return;
        }
        const comm_score = selectedMovie.community_score;
        const user_score = selectedMovie.user_score;
        if (comm_score < dislikeCutoff && user_score < dislikeCutoff) {
            setRatingSummary('You and your community both dislike this movie.');
        } else if (comm_score < dislikeCutoff && user_score > likeCutoff) {
            setRatingSummary('You like this movie, but your community dislikes it.');
        } else if (comm_score > likeCutoff && user_score < dislikeCutoff) {
            setRatingSummary('You dislike this movie, but your community likes it.');
        } else if (comm_score > likeCutoff && user_score > likeCutoff) {
            setRatingSummary('You and your community both like this movie.');
        }
    }, [selectedMovie, likeCutoff, dislikeCutoff]);
    if (!selectedMovie) return <></>;
    return (
        <div className="bg-slate-100 m-1 p-1 rounded-md">
            <div className="p-3">
                <img
                    className="mx-auto h-81 rounded-3"
                    src={selectedMovie.tmdb_poster}
                    alt={`Post for the ${selectedMovie.title}`}
                    onError={(e) => {
                        e.currentTarget.src = 'https://placehold.co/400x600/000000/FFFFFF?text=No+Image';
                    }}
                />
            </div>
            <div className="">
                <h3 className="movie-title">
                    {selectedMovie.title} ({selectedMovie.year})
                </h3>
            </div>
            {showLikeDislikeByLine && (
                <div className="mt-3 font-medium">
                    <p>{ratingSummary}</p>
                </div>
            )}
            <div className="p-3 text-left">
                <p className="mt-5">
                    <strong>Cast: </strong>
                </p>
                <ExpandableText text={selectedMovie.cast!} wordLimit={5} delimiter="|" joiner={', '} />
                <p className="mt-3">
                    <strong>Director: </strong>
                </p>
                <ExpandableText text={selectedMovie.director!} wordLimit={5} delimiter="|" joiner={', '} />
                <ExpandableText text={selectedMovie.description} wordLimit={25} className="mt-5" />
            </div>
        </div>
    );
};

const ExpandableText = ({
    text,
    wordLimit = 25,
    delimiter = ' ',
    joiner = ' ',
    className = '',
}: {
    text: string;
    wordLimit?: number;
    delimiter?: string;
    joiner?: string;
    className?: string;
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const words = text.split(delimiter);
    const isTruncated = words.length > wordLimit;

    const displayText = isExpanded ? words.join(joiner) : words.slice(0, wordLimit).join(joiner);

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <p className={className}>
            {displayText}
            {isTruncated && (
                <span onClick={toggleExpanded} className="cursor-pointer text-blue-500 hover:text-blue-700">
                    {isExpanded ? ' show less' : '... show more'}
                </span>
            )}
        </p>
    );
};

export default RightInfoPanel;

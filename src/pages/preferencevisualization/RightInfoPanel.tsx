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
    const [prefSummaryLabel, setPrefSummaryLabel] = useState('');
    const { selectedMovie } = useMovieSelection<PreferenceVizRecommendedItem>();

    useEffect(() => {
        if (!selectedMovie) {
            setPrefSummaryLabel('Select a movie to see details.');
            return;
        }
        const prefCutoffRange = Math.abs(likeCutoff - dislikeCutoff);
        const comm_score = selectedMovie.community_score;
        const user_score = selectedMovie.user_score;
        let yourPrefLabel = '';
        let communityPrefLabel = '';

        if (user_score < dislikeCutoff - prefCutoffRange) {
            yourPrefLabel = 'You are predicted to dislike this movie';
        } else if (user_score > likeCutoff + prefCutoffRange) {
            yourPrefLabel = 'You are predicted to like this movie';
        } else {
            yourPrefLabel = 'You are predicted to be ambivalent towards this movie';
        }
        if (comm_score < dislikeCutoff - prefCutoffRange) {
            communityPrefLabel = 'everyone else in the system dislikes this movie';
        } else if (comm_score > likeCutoff + prefCutoffRange) {
            communityPrefLabel = 'everyone else in the system likes this movie';
        } else {
            communityPrefLabel = 'everyone else in the system is ambivalent towards this movie';
        }
        setPrefSummaryLabel(`${yourPrefLabel}, and ${communityPrefLabel}.`);
    }, [selectedMovie, likeCutoff, dislikeCutoff]);
    if (!selectedMovie) return <></>;

    console.log(selectedMovie);

    return (
        <div className="bg-slate-100 m-1 p-1 rounded-md" id="info-panel-sidebar">
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
                <h3 className="font-bold">
                    {selectedMovie.title} ({selectedMovie.year})
                </h3>
            </div>
            {showLikeDislikeByLine && (
                <div className="mt-3 ml-3 text-left">
                    <p className="text-sm italic">{prefSummaryLabel}</p>
                </div>
            )}
            <div className="ml-3 mb-3 text-left">
                <p className="mt-3 font-semibold">Description:</p>
                <ExpandableText text={selectedMovie.description} wordLimit={25} className="mt-1 text-sm" />
                <p className="mt-3 font-semibold">Cast:</p>
                <ExpandableText
                    text={selectedMovie.cast!}
                    wordLimit={5}
                    delimiter="|"
                    joiner={', '}
                    className="mt-1 text-sm"
                />
                <p className="mt-3 font-semibold">Director:</p>
                <ExpandableText
                    text={selectedMovie.director!}
                    wordLimit={5}
                    delimiter="|"
                    joiner={', '}
                    className="mt-1 text-sm"
                />
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
                <span onClick={toggleExpanded} className="ml-1 cursor-pointer text-blue-500 hover:text-blue-700">
                    {isExpanded ? ' show less' : '... show more'}
                </span>
            )}
        </p>
    );
};

export default RightInfoPanel;

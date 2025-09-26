import { useMutation } from '@tanstack/react-query';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { useStudy } from 'rssa-api';
import { useDebounce } from '../../hooks/useDebounce';
import type { MovieDetails, RatedItem } from '../../types/rssa.types';
import StarRating from '../StarRating';

const MovieCard = ({
    movie,
    userRating,
    onClick,
    onRated,
}: {
    movie: MovieDetails;
    userRating: number;
    onClick: () => void;
    onRated: (ratedItem: RatedItem) => void;
}) => {
    const [movieRating, setMovieRating] = useState<number>(userRating);
    const [prevRating, setPrevRating] = useState<number>(userRating);
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const { studyApi } = useStudy();

    const debouncedValue = useDebounce(movieRating, 500);

    const ratingMutation = useMutation({
        mutationKey: ['movie', movie.id],
        mutationFn: async (ratingPayload: RatedItem) => {
            studyApi.patch<RatedItem>(`responses/ratings`, ratingPayload);
            return ratingPayload;
        },
        onSuccess: (ratedItem: RatedItem) => {
            onRated(ratedItem);
        },
        onError: () => {
            console.error('Failed to save rating on the server.');
            setMovieRating(prevRating);
        },
    });

    useEffect(() => {
        if (debouncedValue !== 0 && !ratingMutation.isPending) {
            const ratingPayload = {
                item_id: movie.id,
                rating: debouncedValue,
            };
            ratingMutation.mutateAsync(ratingPayload);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedValue, movie.id, ratingMutation.mutateAsync, ratingMutation.isPending]);

    const handleRating = (newRating: number) => {
        setPrevRating(movieRating);
        setMovieRating(newRating);
    };

    return (
        <div
            className={clsx(
                'bg-red-200 lg:w-45 xl:w-54 xxl:w-72',
                'rounded-lg overflow-hidden shadow-lg',
                'transform transition-transform duration-300 hover:scale-115 cursor-pointer',
                'flex flex-col hover:z-10'
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative lg:h-54 xxl:h-81 flex items-center justify-center bg-black">
                <img
                    className={clsx('h-full w-full', isHovered ? 'object-contain' : 'object-contain')}
                    src={movie.poster}
                    alt={`Poster for ${movie.title}`}
                    onError={(e) => {
                        e.currentTarget.src = 'https://placehold.co/400x600/000000/FFFFFF?text=No+Image';
                    }}
                />
                <div className={clsx('absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent')}>
                    <div className="absolute bottom-0 w-full pt-4 px-1 flex flex-col items center text-center">
                        <p className="text-white text-md font-medium mb-0 leading-tight">{movie.title}</p>
                        <p className="text-gray-300 text-md mx-auto">{movie.year}</p>
                    </div>
                </div>
            </div>
            <div className="bg-gray-700 py-1">
                <StarRating initialRating={movieRating} onRatingChange={handleRating} maxStars={5} />
            </div>
        </div>
    );
};

export default MovieCard;

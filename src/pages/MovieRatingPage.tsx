import { useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import React, { useCallback } from 'react';
import { useStudy } from 'rssa-api';
import MovieCard from '../components/moviegallery/MovieCard';
import PaginatedResourceViewer from '../components/PaginatedDataViewer';
import { useStepCompletion } from '../hooks/useStepCompletion';
import type { MovieDetails, RatedItem } from '../types/rssa.types';

const MovieRatingPage: React.FC = () => {
    const itemsPerPage = 18;
    const minRatingCount = 10;

    const { studyApi } = useStudy();
    const { setIsStepComplete } = useStepCompletion();

    const queryClient = useQueryClient();

    const { data: ratedMovies, isLoading } = useQuery({
        queryKey: ['movieRatings'],
        queryFn: async () => await studyApi.get<RatedItem[]>(`responses/ratings`),
        enabled: !!studyApi,
    });

    const handleRating = useCallback(
        (ratedItem: RatedItem) => {
            queryClient.setQueryData<RatedItem[]>(['movieRatings'], (oldData: RatedItem[] | undefined) => {
                const existingRatings = oldData || [];
                const existingItemIndex = existingRatings.findIndex((item) => item.item_id === ratedItem.item_id);
                if (existingItemIndex > -1) {
                    return existingRatings.map((item, index) => (index === existingItemIndex ? ratedItem : item));
                }
                return [...existingRatings, ratedItem];
            });
        },
        [queryClient]
    );
    const ratedCount = ratedMovies?.length ?? 0;

    if (ratedCount >= 10) setIsStepComplete(true);

    return (
        <div className="text-gray-900">
            <div className="md:w-360 mx-auto p-3 bg-gray-300 rounded-3">
                <PaginatedResourceViewer<MovieDetails> apiResourceTag="movies" limit={itemsPerPage}>
                    {(movies, _, handleItemClick) => (
                        <div className={clsx('grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3')}>
                            {movies.length > 0 ? (
                                movies.map((movie) => {
                                    const ratedMovie = ratedMovies?.find(
                                        (rated: RatedItem) => rated.item_id === movie.id
                                    );
                                    return (
                                        <MovieCard
                                            key={movie.id}
                                            movie={movie}
                                            userRating={ratedMovie ? ratedMovie.rating : 0}
                                            onClick={() => handleItemClick(movie)}
                                            onRated={handleRating}
                                        />
                                    );
                                })
                            ) : (
                                <p>No movies found for this page.</p>
                            )}
                        </div>
                    )}
                </PaginatedResourceViewer>
            </div>
            <div className="p-3">
                <RankHolder count={ratedCount} max={minRatingCount} />
            </div>
        </div>
    );
};

interface RankHolderProps {
    count: number;
    max: number;
}

const RankHolder: React.FC<RankHolderProps> = ({ count, max }) => {
    return (
        <div className="font-medium text-lg">
            <span>Rated Movies: </span>
            <span>
                <i> {count} </i>
            </span>
            <span>
                <i>of {max}</i>
            </span>
        </div>
    );
};

export default MovieRatingPage;

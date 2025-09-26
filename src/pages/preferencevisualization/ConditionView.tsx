import { useQuery } from '@tanstack/react-query';
import { useStudy } from 'rssa-api';
import LoadingScreen from '../../components/loadingscreen/LoadingScreen';
import Baseline from '../../components/visualiations/Baseline';
import ContinuousCoupled from '../../components/visualiations/ContinuousCoupled';
import ContinuousDecoupled from '../../components/visualiations/ContinuousDecoupled';
import ContinuousSelf from '../../components/visualiations/ContinuousSelf';
import DiscreteDecoupled from '../../components/visualiations/DiscreteDecoupled';
import DiscreteSelf from '../../components/visualiations/DiscreteSelf';
import { useMovieSelection } from '../../hooks/useMovieSelection';
import {
    type PreferenceVizRecommendedItem,
    type PreferenceVizResponseObject,
    type RecommendationType,
} from '../../types/preferenceVisualization.types';
import type { RatedItem } from '../../types/rssa.types';
import ResponsiveContainer from './ResponsiveContainer';

type ConditionViewProps = {
    condition: number;
    ratedItems: RatedItem[];
    recommendationType: RecommendationType;
};

const ConditionView: React.FC<ConditionViewProps> = ({ condition, ratedItems, recommendationType }) => {
    const { setSelectedMovie } = useMovieSelection<PreferenceVizRecommendedItem>();
    const { studyApi } = useStudy();

    const { data: recommendations, isLoading: recommendationsLoading } = useQuery({
        queryKey: ['recommendations', condition, ratedItems?.map((item) => item.item_id)],
        queryFn: async () => {
            const payload = { rec_type: recommendationType, ratings: ratedItems };
            const response = await studyApi.post<
                PreferenceVizResponseObject,
                { rec_type: string; ratings: RatedItem[] | undefined }
            >('recommendations/prefviz', payload);
            return response;
        },
        enabled: !!ratedItems,
    });

    if (recommendationsLoading || !recommendations) {
        return <LoadingScreen loading={true} message="Loading Recommendations" />;
    }

    const handleHover = (item_id: string) => {
        const selectedMovie = recommendations[item_id];
        if (selectedMovie) setSelectedMovie(selectedMovie);
    };

    switch (condition) {
        case 1:
        case 11:
            return (
                <ResponsiveContainer>
                    {(width, height) => (
                        <ContinuousCoupled
                            width={width}
                            height={height}
                            data={recommendations}
                            xCol={'community_score'}
                            yCol={'user_score'}
                            onHover={handleHover}
                        />
                    )}
                </ResponsiveContainer>
            );
        case 2:
        case 21:
            return (
                <ResponsiveContainer>
                    {(width, height) => (
                        <ContinuousDecoupled
                            width={width}
                            height={height}
                            data={recommendations}
                            xCol={'community_score'}
                            yCol={'user_score'}
                            onHover={handleHover}
                        />
                    )}
                </ResponsiveContainer>
            );
        case 3:
        case 31:
            return (
                <ResponsiveContainer>
                    {(width, height) => (
                        <DiscreteDecoupled
                            width={width}
                            height={height}
                            data={recommendations}
                            xCol={'community_score'}
                            yCol={'user_score'}
                            onHover={handleHover}
                        />
                    )}
                </ResponsiveContainer>
            );
        case 4:
            return (
                <ResponsiveContainer>
                    {(width, height) => (
                        <Baseline
                            width={width}
                            height={height}
                            data={recommendations}
                            xCol={'community_score'}
                            yCol={'user_score'}
                            onHover={handleHover}
                        />
                    )}
                </ResponsiveContainer>
            );
        case 5:
        case 51:
        case 52:
            return (
                <ResponsiveContainer>
                    {(width, height) => (
                        <ContinuousSelf
                            width={width}
                            height={height}
                            data={recommendations}
                            xCol={'community_score'}
                            yCol={'user_score'}
                            onHover={handleHover}
                        />
                    )}
                </ResponsiveContainer>
            );
        case 6:
        case 61:
        case 62:
            return (
                <ResponsiveContainer>
                    {(width, height) => (
                        <DiscreteSelf
                            width={width}
                            height={height}
                            data={recommendations}
                            xCol={'community_score'}
                            yCol={'user_score'}
                            onHover={handleHover}
                        />
                    )}
                </ResponsiveContainer>
            );
        default:
            return <LoadingScreen loading={true} message="Loading Recommendations" />;
    }
};

export default ConditionView;

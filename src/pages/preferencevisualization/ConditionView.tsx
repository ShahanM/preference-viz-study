import { useQuery } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
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
    type RecommendationRequestPayload,
    type RecommendationType,
    type BackendRecommendationResponse,
} from '../../types/preferenceVisualization.types';
import { type StudyLayoutContextType } from '../../types/study.types';
import ResponsiveContainer from './ResponsiveContainer';

type ConditionViewProps = {
    condition: number;
    recommendationType: RecommendationType;
};

const ConditionView: React.FC<ConditionViewProps> = ({ condition, recommendationType }) => {
    const { studyStep } = useOutletContext<StudyLayoutContextType>();
    const { studyApi } = useStudy();
    const { setSelectedMovie } = useMovieSelection<PreferenceVizRecommendedItem>();

    const { data: recommendations, isLoading: recommendationsLoading } = useQuery({
        queryKey: ['recommendations', condition],
        queryFn: async () => {
            let algoKey = 'biased_recs_top_n';
            if (recommendationType === 'diverse') algoKey = 'biased_recs_diverse_community_score';
            if (recommendationType === 'reference') algoKey = 'biased_recs_reference_community_score';

            const payload = {
                step_id: studyStep.id,
                context_tag: 'preference visualization recommendations',
                rec_type: recommendationType,
                algorithm_key: algoKey,
            };


            // Fetch as BackendRecommendationResponse
            const response = await studyApi.post<RecommendationRequestPayload, BackendRecommendationResponse>(
                'recommendations/',
                payload
            );


            // Adapter: Convert BackendResponse to Frontend PreferenceVizResponseObject
            const adaptedResponse: PreferenceVizResponseObject = {};

            Object.entries(response).forEach(([key, value]) => {
                const { item, score, label, ...rest } = value;
                // Check if 'item' is present and is an object (nested structure)
                // If the backend sends flattened structure by mistake, we might need a check, 
                // but we assume stricter adherence to specific backend schema here.
                if (item && typeof item === 'object') {
                    adaptedResponse[key] = {
                        ...item, // Spread all movie properties
                        ...rest, // Spread community_score, community_label, cluster
                        item_id: key, // Ensure item_id matches the key
                        user_score: score, // Map score -> user_score
                        user_label: label, // Map label -> user_label
                    };
                } else {
                    // Fallback/Warning if schema doesn't match expectation
                    console.warn(`Unexpected item structure for key ${key}:`, value);
                }
            });


            return adaptedResponse;
        },
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

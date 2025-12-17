import type { Movie } from './rssa.types';

export type RecommendationType = 'baseline' | 'diverse' | 'reference';

export interface PreferenceVizAlgoSetting {
    algorithm: string;
    randomize: boolean;
    initial_sample_size: number;
    min_rating_count: number;
    recommendation_count: number;
}

export interface CommunityPreferenceFeature {
    community_label: number;
    community_score: number;
}

export interface UserPreferenceFeature {
    user_score: number;
    user_label: number;
}

export interface PreferenceVizRecommendationFeature extends UserPreferenceFeature, CommunityPreferenceFeature {
    item_id: string;
    cluster: number;
}

export interface PreferenceVizObject {
    algorithm_settings: PreferenceVizAlgoSetting;
    recommendation_features: PreferenceVizRecommendationFeature;
}

export interface PreferenceVizRecommendedItem extends Movie, PreferenceVizRecommendationFeature { }

export interface PreferenceVizResponseObject {
    [key: string]: PreferenceVizRecommendedItem;
}

export interface PreferenceVizComponentProps {
    width: number;
    height: number;
    data: PreferenceVizResponseObject;
    xCol: string;
    yCol: string;
    onHover: (item_id: string) => void;
}

export interface PreferenceVizDataMixin {
    x?: number;
    y?: number;
    vx?: number;
    vy?: number;
    index?: number;
}

export interface DataAugmentedItem extends PreferenceVizRecommendedItem, PreferenceVizDataMixin { }

export interface EssayResponseObject {
    familiarity: string;
    exploration: string;
    explanation: string;
}

export interface EssayResponse {
    id?: string;
    payload_json: EssayResponseObject;
    version?: number;
}

export interface ParticipantResponsePayload {
    study_step_id: string;
    study_step_page_id: string | null;
    context_tag: string;
    payload_json: EssayResponseObject;
}

export interface BackendCommunityScoreItem {
    item: Movie;
    community_score: number;
    score: number;
    community_label: number;
    label: number;
    cluster: number;
}

export interface BackendRecommendationResponse {
    [key: string]: BackendCommunityScoreItem;
}

export interface RecommendationRequestPayload {
    step_id: string;
    step_page_id?: string;
    context_tag: string;
    rec_type?: RecommendationType;
    algorithm_key?: string;
}

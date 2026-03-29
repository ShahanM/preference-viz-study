// conditionMap.ts
import type { Movie } from '@rssa-project/study-template';
import Baseline from '../../components/visualiations/Baseline';
import ContinuousCoupled from '../../components/visualiations/ContinuousCoupled';
import ContinuousDecoupled from '../../components/visualiations/ContinuousDecoupled';
import ContinuousSelf from '../../components/visualiations/ContinuousSelf';
import DiscreteCoupled from '../../components/visualiations/DiscreteCoupled';
import DiscreteDecoupled from '../../components/visualiations/DiscreteDecoupled';
import DiscreteSelf from '../../components/visualiations/DiscreteSelf';
import type {
    PreferenceVizComponentProps,
    PreferenceVizRecommendedItem,
} from '../../types/preferenceVisualization.types';

export type ConditionConfig = {
    Visualizer:
        | React.FC<PreferenceVizComponentProps<PreferenceVizRecommendedItem>>
        | React.FC<PreferenceVizComponentProps<Movie>>;
    layout: 'sidebar' | 'overlay';
    xCol: string;
    yCol: string;
};

export const conditionMap: Record<string, ConditionConfig> = {
    CONT_COUPLED: {
        Visualizer: ContinuousCoupled,
        layout: 'sidebar',
        xCol: 'community_score',
        yCol: 'user_score',
    },
    CONT_DECOUPLED: {
        Visualizer: ContinuousDecoupled,
        layout: 'sidebar',
        xCol: 'community_score',
        yCol: 'user_score',
    },
    DISC_DECOUPLED: {
        Visualizer: DiscreteDecoupled,
        layout: 'sidebar',
        xCol: 'community_score',
        yCol: 'user_score',
    },
    DISC_COUPLED: {
        Visualizer: DiscreteCoupled,
        layout: 'sidebar',
        xCol: 'community_score',
        yCol: 'user_score',
    },
    CONT_SELF: {
        Visualizer: ContinuousSelf,
        layout: 'sidebar',
        xCol: 'community_score',
        yCol: 'user_score',
    },
    DISC_SELF: {
        Visualizer: DiscreteSelf,
        layout: 'sidebar',
        xCol: 'community_score',
        yCol: 'user_score',
    },
    BASE_TOPN: {
        Visualizer: Baseline,
        layout: 'sidebar',
        xCol: '',
        yCol: '',
    },
};

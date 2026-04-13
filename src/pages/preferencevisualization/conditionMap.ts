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

export type TourData = {
    title: string;
    description: string;
};
export type ConditionConfig = {
    Visualizer:
        | React.FC<PreferenceVizComponentProps<PreferenceVizRecommendedItem>>
        | React.FC<PreferenceVizComponentProps<Movie>>;
    layout: 'sidebar' | 'overlay';
    xCol: string;
    yCol: string;
    scenarioText: string;
    tourContent: TourData;
};

export const conditionMap: Record<string, ConditionConfig> = {
    CONT_COUPLED: {
        Visualizer: ContinuousCoupled,
        layout: 'sidebar',
        xCol: 'community_score',
        yCol: 'user_score',
        scenarioText: 'visualizes your movie preferences and juxtaposes them against everyone else in the system',
        tourContent: {
            title: 'Continuous coupled visualization',
            description:
                "The vertical axis in the visualization shows your predicted preferences -- dislikes at the bottom (rating 1/5), and likes at the top (rating 5/5). The horizontal axis shows everyone else's predicted preferences -- dislikes on the left (rating 1/5), and likes on the right (rating 5/5).",
        },
    },
    CONT_DECOUPLED: {
        Visualizer: ContinuousDecoupled,
        layout: 'sidebar',
        xCol: 'community_score',
        yCol: 'user_score',
        scenarioText: 'visualizes your movie preferences and juxtaposes them against everyone else in the system',
        tourContent: {
            title: 'Continuous decoupled visualization',
            description:
                'The top half of the visualization shows your predicted preferences, the bottom half shows the preferences of everyone else. The left side shows dislikes (rating 1/5), the right side shows likes (rating 5/5).',
        },
    },
    DISC_DECOUPLED: {
        Visualizer: DiscreteDecoupled,
        layout: 'sidebar',
        xCol: 'community_score',
        yCol: 'user_score',
        scenarioText: 'visualizes your movie preferences and juxtaposes them against everyone else in the system',
        tourContent: {
            title: 'Discrete decoupled',
            description:
                'The top half of the visualization shows your predicted preferences, the bottom half shows the preferences of everyone else. The boxes on the left show dislikes, and the boxes on the right show likes.',
        },
    },
    DISC_COUPLED: {
        Visualizer: DiscreteCoupled,
        layout: 'sidebar',
        xCol: 'community_score',
        yCol: 'user_score',
        scenarioText: 'visualizes your movie preferences and juxtaposes them against everyone else in the system',
        tourContent: {
            title: '',
            description: '',
        },
    },
    CONT_SELF: {
        Visualizer: ContinuousSelf,
        layout: 'sidebar',
        xCol: 'community_score',
        yCol: 'user_score',
        scenarioText: 'visualizes your movie preferences',
        tourContent: {
            title: '',
            description:
                'The visualization shows your predicted preferences on a scale of 1 to 5. The left side shows dislike (rating 1/5), the right side shows likes (rating 5/5).',
        },
    },
    DISC_SELF: {
        Visualizer: DiscreteSelf,
        layout: 'sidebar',
        xCol: 'community_score',
        yCol: 'user_score',
        scenarioText: 'visualizes your movie preferences',
        tourContent: {
            title: '',
            description:
                'The visualization shows your predicted preferences. The left box shows the movies you are predicted to dislike and the right box shows the movies you are predicted to like.',
        },
    },
    BASE_TOPN: {
        Visualizer: Baseline,
        layout: 'sidebar',
        xCol: '',
        yCol: '',
        scenarioText: 'that shows you the movies the system thinks you will like',
        tourContent: {
            title: '',
            description: 'The list shows your predicted preferences.',
        },
    },
};

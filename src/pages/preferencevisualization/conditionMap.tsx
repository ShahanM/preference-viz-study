import React from 'react';
import Baseline from '../../components/visualiations/Baseline';
import ContinuousCoupled from '../../components/visualiations/ContinuousCoupled';
import ContinuousDecoupled from '../../components/visualiations/ContinuousDecoupled';
import ContinuousSelf from '../../components/visualiations/ContinuousSelf';
import DiscreteDecoupled from '../../components/visualiations/DiscreteDecoupled';
import DiscreteSelf from '../../components/visualiations/DiscreteSelf';
import DiscreteCoupled from '../../components/visualiations/DiscreteCoupled';
import {
    type PreferenceVizComponentProps,
    type PreferenceVizRecommendedItem,
} from '../../types/preferenceVisualization.types';
import { type Movie } from '../../types/rssa.types';

const ContinuousCoupledWrapper: React.FC<PreferenceVizComponentProps<PreferenceVizRecommendedItem>> = ({
    isFisheye = false,
    ...props
}) => <ContinuousCoupled {...props} isFisheye={isFisheye} xCol="community_score" yCol="score" />;

const ContinuousDecoupledWrapper: React.FC<PreferenceVizComponentProps<PreferenceVizRecommendedItem>> = ({
    isFisheye = false,
    ...props
}) => <ContinuousDecoupled {...props} isFisheye={isFisheye} xCol="community_score" yCol="user_score" />;

const DiscreteCoupledWrapper: React.FC<PreferenceVizComponentProps<PreferenceVizRecommendedItem>> = ({
    isFisheye = false,
    ...props
}) => <DiscreteCoupled {...props} isFisheye={isFisheye} xCol="community_score" yCol="user_score" />;

const DiscreteDecoupledWrapper: React.FC<PreferenceVizComponentProps<PreferenceVizRecommendedItem>> = ({
    isFisheye = false,
    ...props
}) => <DiscreteDecoupled {...props} isFisheye={isFisheye} xCol="community_score" yCol="user_score" />;

const ContinuousSelfWrapper: React.FC<PreferenceVizComponentProps<PreferenceVizRecommendedItem>> = ({
    isFisheye = false,
    ...props
}) => <ContinuousSelf {...props} isFisheye={isFisheye} xCol="community_score" yCol="user_score" />;

const DiscreteSelfWrapper: React.FC<PreferenceVizComponentProps<PreferenceVizRecommendedItem>> = ({
    isFisheye = false,
    ...props
}) => <DiscreteSelf {...props} isFisheye={isFisheye} xCol="community_score" yCol="user_score" />;

const BaselineWrapper: React.FC<PreferenceVizComponentProps<Movie>> = ({ isFisheye = false, data, ...props }) => (
    <Baseline {...props} data={data} />
);

export type ConditionConfig = {
    Visualizer:
        | React.FC<PreferenceVizComponentProps<PreferenceVizRecommendedItem>>
        | React.FC<PreferenceVizComponentProps<Movie>>;
    layout: 'sidebar' | 'overlay';
};

export const conditionMap: Record<string, ConditionConfig> = {
    /**
     * Map the condition short_code for the respective StudyConditions from the Admin Dashboard to
     * the visualizer components above.
     */
    CONT_COUPLED: {
        // Continuous Coupled - Diverse vs referenced
        Visualizer: ContinuousCoupledWrapper,
        layout: 'sidebar',
    },
    CONT_DECOUPLED: {
        // Continuous Decoupled - Diverse vs referenced
        Visualizer: ContinuousDecoupledWrapper,
        layout: 'sidebar',
    },
    DISC_DECOUPLED: {
        // Discrete Decoupled - Diverse vs referenced
        Visualizer: DiscreteDecoupledWrapper,
        layout: 'sidebar',
    },
    DISC_COUPLED: {
        // Discrete Coupled - Not included in this study
        Visualizer: DiscreteCoupledWrapper,
        layout: 'sidebar',
    },
    CONT_SELF: {
        // Continuous Self - Top N (single view)
        Visualizer: ContinuousSelfWrapper,
        layout: 'sidebar',
    },
    DISC_SELF: {
        // Discrete Self - Top N (single view)
        Visualizer: DiscreteSelfWrapper,
        layout: 'sidebar',
    },
    BASE_TOPN: {
        // Baseline Top N - Top N (single view)
        Visualizer: BaselineWrapper,
        layout: 'sidebar',
    },
};

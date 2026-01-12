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
    // "Continuous Coupled": { Visualizer: ContinuousCoupledWrapper, layout: 'sidebar' }, // Diverse vs referenced
    // "Continuous Decoupled": { Visualizer: ContinuousDecoupledWrapper, layout: 'sidebar' }, // Diverse vs referenced
    // "Discrete Decoupled": { Visualizer: DiscreteDecoupledWrapper, layout: 'sidebar' }, // Diverse vs referenced
    // "Continuous Top N": { Visualizer: ContinuousSelfWrapper, layout: 'sidebar' }, // Top N (single view)
    // "Discrete Top N": { Visualizer: DiscreteSelfWrapper, layout: 'sidebar' }, // Top N (single view)
    // "Baseline Top N": { Visualizer: BaselineWrapper, layout: 'overlay' }, // Top N (single view)
    // ---
    // "Discrete Coupled": { Visualizer: DiscreteCoupledWrapper, layout: 'sidebar' }, Not included in this study

    /**
     * Map the condition short_code for the respective StudyConditions from the Admin Dashboard to
     * the visualizer components above.
     */
    // 'Umber-Swift': { Visualizer: ContinuousCoupledWrapper, layout: 'sidebar' },
    'Bronze-Narwhal': { Visualizer: ContinuousCoupledWrapper, layout: 'sidebar' },
    Placeholder1: { Visualizer: ContinuousDecoupledWrapper, layout: 'sidebar' },
    // 'Umber-Swift': { Visualizer: ContinuousDecoupledWrapper, layout: 'sidebar' },
    // Placeholder2: { Visualizer: DiscreteDecoupledWrapper, layout: 'sidebar' },
    'Umber-Swift': { Visualizer: DiscreteDecoupledWrapper, layout: 'sidebar' },
    Placeholder3: { Visualizer: DiscreteCoupledWrapper, layout: 'sidebar' },
    // 'Umber-Swift': { Visualizer: DiscreteCoupledWrapper, layout: 'sidebar' },
    Placehodler4: { Visualizer: ContinuousSelfWrapper, layout: 'sidebar' },
    // 'Umber-Swift': { Visualizer: ContinuousSelfWrapper, layout: 'sidebar' },
    Placeholder5: { Visualizer: DiscreteSelfWrapper, layout: 'sidebar' },
    // 'Umber-Swift': { Visualizer: DiscreteSelfWrapper, layout: 'sidebar' },
    'Obsidian-Pangolin': { Visualizer: BaselineWrapper, layout: 'sidebar' },
    // 'Umber-Swift': { Visualizer: BaselineWrapper, layout: 'sidebar' },
};

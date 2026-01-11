import React from 'react';
import Baseline from '../../components/visualiations/Baseline';
import ContinuousCoupled from '../../components/visualiations/ContinuousCoupled';
import ContinuousDecoupled from '../../components/visualiations/ContinuousDecoupled';
import ContinuousSelf from '../../components/visualiations/ContinuousSelf';
import DiscreteDecoupled from '../../components/visualiations/DiscreteDecoupled';
import DiscreteSelf from '../../components/visualiations/DiscreteSelf';
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

export const conditionMap: Record<
    string,
    React.FC<PreferenceVizComponentProps<PreferenceVizRecommendedItem>> | React.FC<PreferenceVizComponentProps<Movie>>
> = {
    // "Continuous Coupled": ContinuousCoupledWrapper,
    // "Continuous Decoupled": ContinuousDecoupledWrapper, (Variants: Self, Community)
    // "Discrete Coupled": DiscreteCoupledWrapper,
    // "Discrete Decoupled": DiscreteDecoupledWrapper, (Variants: Self, Community)
    // "Baseline": BaselineWrapper,

    /**
     * Map the condition short_code for the respective StudyConditions from the Admin Dashboard to
     * the visualizer components above.
     */
    'Continuous Coupled': ContinuousCoupledWrapper,
    'Explicit Continuous coupled 20 recs': ContinuousCoupledWrapper,
    'Continuous Decoupled': ContinuousDecoupledWrapper,
    'Discrete Decoupled': DiscreteDecoupledWrapper,
    'Continuous Decoupled - Self': ContinuousSelfWrapper,
    'Continuous Self': ContinuousSelfWrapper,
    'Discrete Decoupled - Self': DiscreteSelfWrapper,
    'Discrete Self': DiscreteSelfWrapper,
    'Obsidian-Pangolin': BaselineWrapper,
};

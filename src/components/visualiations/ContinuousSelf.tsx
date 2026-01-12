import React from 'react';
import type {
    PreferenceVizComponentProps,
    PreferenceVizRecommendedItem,
} from '../../types/preferenceVisualization.types';
import ContinuousDecoupled from './ContinuousDecoupled';

const ContinuousSelf: React.FC<PreferenceVizComponentProps<PreferenceVizRecommendedItem>> = (props) => {
    return <ContinuousDecoupled {...props} showCommunity={false} />;
};

export default ContinuousSelf;

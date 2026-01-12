import React from 'react';
import type {
    PreferenceVizComponentProps,
    PreferenceVizRecommendedItem,
} from '../../types/preferenceVisualization.types';
import DiscreteDecoupled from './DiscreteDecoupled';

const DiscreteSelf: React.FC<PreferenceVizComponentProps<PreferenceVizRecommendedItem>> = (props) => {
    return <DiscreteDecoupled {...props} showCommunity={false} />;
};

export default DiscreteSelf;

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useStudy } from 'rssa-api';
import { useFetchParticipant } from 'rssa-api';
import { MovieSelectionProvider } from '../../contexts/movieSelectionProvider';
import type { EssayResponse } from '../../types/preferenceVisualization.types';
import type { StudyLayoutContextType } from '../../types/study.types';
import { DISLIKE_CUTOFF, LIKE_CUTOFF } from '../../utils/constants';
import ConditionView from './ConditionView';
import ParticipantResponsePanel from './ParticipantResponsePanel';
import RightInfoPanel from './RightInfoPanel';
import { conditionMap } from './conditionMap';

const PreferenceVisualizationContent: React.FC = () => {
    const { studyApi } = useStudy();
    const { studyStep } = useOutletContext<StudyLayoutContextType>();

    const { data: participant } = useFetchParticipant();

    const conditionIdentifier = participant?.study_condition?.short_code;
    const conditionName = participant?.study_condition?.name;
    const conditionId = participant?.study_condition?.id;

    const ConditionalVisualizer = conditionIdentifier ? conditionMap[conditionIdentifier] : undefined;

    const showLikeDislikeLines = useMemo(() => {
        if (!conditionIdentifier) return true;
        const lowerName = conditionIdentifier.toLowerCase();
        return !lowerName.includes('baseline') && !lowerName.includes('self');
    }, [conditionIdentifier]);

    const { data: essayResponseData } = useQuery({
        queryKey: ['participantResponse'],
        queryFn: async () => await studyApi.get<EssayResponse>(`responses/interactions/${studyStep.id}`),
        enabled: !!studyApi,
    });

    const essayResponse = useMemo(() => {
        if (!essayResponseData) return undefined;
        if (essayResponseData instanceof Array) {
            return essayResponseData[0];
        }
    }, [essayResponseData]);

    if (!participant) {
        return <div className="p-10 text-center">Loading participant data...</div>;
    }

    if (!ConditionalVisualizer) {
        return (
            <div className="p-10 text-center text-red-600">
                <h3 className="text-lg font-bold">Configuration Error</h3>
                <p>
                    No visualization found for condition:{' '}
                    <strong>
                        {conditionName || 'Unknown'} (Code: {conditionIdentifier})
                    </strong>
                    .
                </p>
                <p>Please contact the study administrator to verify the condition mapping.</p>
                {/* Developer Hint: Ensure backend condition name matches keys in conditionMap.tsx */}
            </div>
        );
    }

    // Adapter for ParticipantResponsePanel which expects { id, name }
    const conditionForPanel = {
        id: conditionId || '',
        name: conditionName || '',
    };

    return (
        <div className="">
            <div className="w-full flex flex-between gap-3">
                <div className="w-1/5">
                    <ParticipantResponsePanel condition={conditionForPanel} participantResponse={essayResponse} />
                </div>
                <div className="w-3/5">
                    <ConditionView
                        Visualizer={ConditionalVisualizer}
                        rightPanelProps={{
                            likeCutoff: LIKE_CUTOFF,
                            dislikeCutoff: DISLIKE_CUTOFF,
                            showLikeDislikeByLine: showLikeDislikeLines,
                        }}
                        infoPanelLayout={
                            conditionIdentifier && conditionIdentifier.toLowerCase().includes('decoupled')
                                ? 'sidebar'
                                : 'overlay'
                        }
                    />
                </div>
                <div className="w-1/5">
                    <RightInfoPanel
                        likeCutoff={LIKE_CUTOFF}
                        showLikeDislikeByLine={showLikeDislikeLines}
                        dislikeCutoff={DISLIKE_CUTOFF}
                    />
                </div>
            </div>
        </div>
    );
};

const PreferenceVisualization = () => {
    return (
        <MovieSelectionProvider>
            <PreferenceVisualizationContent />
        </MovieSelectionProvider>
    );
};

export default PreferenceVisualization;

import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
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

import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { useTour } from '../../hooks/useTour';
import { useConditionMapping } from '../../hooks/useConditionMapping';

const PreferenceVisualizationContent: React.FC = () => {
    const { studyApi } = useStudy();
    const { studyStep } = useOutletContext<StudyLayoutContextType>();
    const { startMainTour } = useTour();

    const { data: participant } = useFetchParticipant();

    // Use short_code from backend to resolve internal visualizer key
    const externalCode = participant?.study_condition?.short_code;
    const viewLinkKey = (participant?.study_condition as unknown as { view_link_key?: string })?.view_link_key;

    // Always call the hook to ensure rules of hooks are followed
    const { mappedCondition, isLoading: isMappingLoading } = useConditionMapping(externalCode);

    let finalConditionIdentifier = mappedCondition;
    let isResolving = isMappingLoading;

    if (viewLinkKey) {
        // Precedence Rule: view_link_key overrides mapping
        if (conditionMap[viewLinkKey]) {
            finalConditionIdentifier = viewLinkKey;
            isResolving = false; // We have a direct match, no need to wait for mapping loading
        } else {
            console.warn(
                `view_link_key '${viewLinkKey}' provided but not found in conditionMap. Falling back to mapping.`
            );
            // finalConditionIdentifier remains as mappedCondition (from hook)
        }
    }

    const conditionIdentifier = finalConditionIdentifier; // Use the resolved condition

    const conditionName = participant?.study_condition?.name;
    const conditionId = participant?.study_condition?.id;

    const conditionConfig = conditionIdentifier ? conditionMap[conditionIdentifier] : undefined;
    const ConditionalVisualizer = conditionConfig?.Visualizer;

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

    const handleFullScreenChange = useCallback(
        (isFull: boolean) => {
            if (!isFull) {
                // User exited full screen. Check if we should resume tour.
                // Step index 2 is "Maximize View". If we were there, resume at 3.
                const lastStepIndex = sessionStorage.getItem('current_tour_index');
                if (lastStepIndex === '2') {
                    // 2 is the index of the Enlarge Button step
                    setTimeout(() => {
                        startMainTour(3); // Resume at next step
                    }, 500);
                }
            }
        },
        [startMainTour]
    );

    if (!participant || isResolving) {
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

    const handleVizLoaded = () => {
        // Optional: Check if tour has been seen
        const studyId = import.meta.env.VITE_RSSA_STUDY_ID;
        const tourKey = `${studyId}_tour-seen-${studyStep.id}`;
        const tourSeen = localStorage.getItem(tourKey);
        if (!tourSeen) {
            // Add a small delay to ensure DOM is fully painted
            setTimeout(() => {
                startMainTour(0);
                localStorage.setItem(tourKey, 'true');
            }, 1000);
        }
    };

    return (
        <div className="relative">
            {/* Tour Button */}
            <button
                onClick={() => startMainTour(0)}
                className="fixed bottom-4 right-4 z-50 bg-amber-500 hover:bg-amber-600 text-white rounded-full p-3 shadow-lg transition-transform hover:scale-110"
                title="Start Guided Tour"
            >
                <QuestionMarkCircleIcon className="h-6 w-6" />
            </button>
            <div className="w-full flex flex-between gap-3">
                <div className="w-1/5">
                    <ParticipantResponsePanel condition={conditionForPanel} participantResponse={essayResponse} />
                </div>
                <div className="w-3/5">
                    <ConditionView
                        Visualizer={ConditionalVisualizer}
                        onDataLoaded={handleVizLoaded}
                        onFullScreenChange={handleFullScreenChange}
                        rightPanelProps={{
                            likeCutoff: LIKE_CUTOFF,
                            dislikeCutoff: DISLIKE_CUTOFF,
                            showLikeDislikeByLine: showLikeDislikeLines,
                        }}
                        infoPanelLayout={conditionConfig?.layout || 'overlay'}
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

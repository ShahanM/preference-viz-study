import { Dialog, DialogPanel } from '@headlessui/react';
import { ArrowsPointingOutIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useStudy, useTelemetry } from '@rssa-project/api';
import { LoadingScreen, type Movie, type StudyLayoutContextType } from '@rssa-project/study-template';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useMovieSelection } from '../../hooks/useMovieSelection';
import { useTour } from '../../hooks/useTour';
import {
    type BackendCommunityScoreItem,
    type BackendResponsePayload,
    type PreferenceVizComponentProps,
    type PreferenceVizRecommendedItem,
    type PreferenceVizResponseObject,
    type RecommendationRequestPayload,
    type RecommendationType,
    isPreferenceVizRecommendedItem,
} from '../../types/preferenceVisualization.types';
import ResponsiveContainer from './ResponsiveContainer';
import RightInfoPanel from './RightInfoPanel';
import clsx from 'clsx';

function useRecommendationsFetch(studyStepId: string, recommendationType?: RecommendationType) {
    const { studyApi } = useStudy();

    return useQuery({
        queryKey: ['recommendations', studyStepId],
        queryFn: async () => {
            const payload: RecommendationRequestPayload = {
                step_id: studyStepId,
                context_tag: 'preference visualization recommendations',
                response_type: recommendationType,
            };

            const response = await studyApi.post<RecommendationRequestPayload, BackendResponsePayload>(
                'recommendations/',
                payload
            );

            if (!response) throw new Error('Failed to fetch recommendations');

            const adaptedResponse: PreferenceVizResponseObject = {};

            if (response.response_type === 'standard') {
                Object.entries(response.items).forEach(([key, value]) => {
                    adaptedResponse[key] = value as Movie;
                });
            }

            if (response.response_type === 'community_comparison') {
                Object.entries(response.items).forEach(([, value]) => {
                    const { item, score, label, ...rest } = value as BackendCommunityScoreItem;
                    if (item && typeof item === 'object') {
                        adaptedResponse[item.id] = {
                            ...item,
                            ...rest,
                            item_id: item.id,
                            user_score: score,
                            user_label: label,
                        };
                    }
                });
            }

            return adaptedResponse;
        },
    });
}

const VisualizerContainer = ({
    recommendations,
    Visualizer,
    xCol,
    yCol,
    onHover,
    onInteract,
    isFisheye,
}: {
    recommendations: PreferenceVizResponseObject;
    Visualizer:
        | React.FC<PreferenceVizComponentProps<PreferenceVizRecommendedItem>>
        | React.FC<PreferenceVizComponentProps<Movie>>;
    xCol?: string;
    yCol?: string;
    onHover: (id: string) => void;
    onInteract: (event: string, data?: Record<string, unknown>, id?: string) => void;
    isFisheye?: boolean;
}) => (
    <ResponsiveContainer>
        {(width, height) => {
            const firstItem = Object.values(recommendations)[0];
            if (!firstItem) return null;

            if (isPreferenceVizRecommendedItem(firstItem)) {
                const SpecificVisualizer = Visualizer as React.FC<
                    PreferenceVizComponentProps<PreferenceVizRecommendedItem>
                >;
                return (
                    <SpecificVisualizer
                        width={width}
                        height={height}
                        data={recommendations as Record<string, PreferenceVizRecommendedItem>}
                        xCol={xCol || ''}
                        yCol={yCol || ''}
                        onHover={onHover}
                        onInteract={onInteract}
                        isFisheye={isFisheye}
                    />
                );
            } else {
                const SpecificVisualizer = Visualizer as React.FC<PreferenceVizComponentProps<Movie>>;
                return (
                    <SpecificVisualizer
                        width={width}
                        height={height}
                        data={recommendations as Record<string, Movie>}
                        xCol={xCol || ''}
                        yCol={yCol || ''}
                        onHover={onHover}
                        onInteract={onInteract}
                        isFisheye={isFisheye}
                    />
                );
            }
        }}
    </ResponsiveContainer>
);

type ConditionViewProps = {
    Visualizer:
        | React.FC<PreferenceVizComponentProps<PreferenceVizRecommendedItem>>
        | React.FC<PreferenceVizComponentProps<Movie>>;
    xCol?: string;
    yCol?: string;
    recommendationType?: RecommendationType;
    rightPanelProps?: { likeCutoff: number; dislikeCutoff: number; showLikeDislikeByLine: boolean };
    infoPanelLayout?: 'overlay' | 'sidebar';
    isFisheye?: boolean;
    onDataLoaded?: () => void;
    onFullScreenChange?: (isFullScreen: boolean) => void;
};

const ConditionView: React.FC<ConditionViewProps> = ({
    Visualizer,
    xCol,
    yCol,
    recommendationType,
    rightPanelProps,
    infoPanelLayout = 'overlay',
    isFisheye,
    onDataLoaded,
    onFullScreenChange,
}) => {
    const { studyStep } = useOutletContext<StudyLayoutContextType>();
    const { setSelectedMovie } = useMovieSelection<PreferenceVizRecommendedItem | Movie>();
    const { trackEvent } = useTelemetry();
    const { startFullscreenTour } = useTour();

    const [isFullScreen, setIsFullScreen] = useState(false);
    const [panelPosition, setPanelPosition] = useState<'left' | 'right'>('right');
    const tourStartedRef = useRef(false);

    const { data: recommendations, isLoading } = useRecommendationsFetch(studyStep.id, recommendationType);

    useEffect(() => {
        if (onFullScreenChange) onFullScreenChange(isFullScreen);
        if (isFullScreen && !tourStartedRef.current) {
            tourStartedRef.current = true;
            setTimeout(() => startFullscreenTour(), 500);
        }
    }, [isFullScreen, startFullscreenTour, onFullScreenChange]);

    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            if (infoPanelLayout !== 'overlay') return;
            setPanelPosition(e.clientX > window.innerWidth / 2 ? 'left' : 'right');
        },
        [infoPanelLayout]
    );

    const handleHover = useCallback(
        (item_id: string) => {
            const selectedMovie = recommendations?.[item_id];
            if (selectedMovie) setSelectedMovie(selectedMovie);
        },
        [recommendations, setSelectedMovie]
    );

    useEffect(() => {
        if (!isLoading && recommendations) {
            const firstMovie = Object.values(recommendations)[0];
            if (firstMovie) setSelectedMovie(firstMovie);
            if (onDataLoaded) onDataLoaded();
        }
    }, [isLoading, recommendations, onDataLoaded, setSelectedMovie]);

    if (isLoading || !recommendations) {
        return <LoadingScreen loading={true} message="Loading your preferences. This can take up to 2 minutes." />;
    }

    return (
        <div className="relative w-full h-full group" id="condition-view-container">
            <button
                type="button"
                id="viz-enlarge-btn"
                onClick={() => setIsFullScreen(true)}
                className={clsx(
                    'absolute top-2 right-2 p-1.5',
                    'text-gray-900 bg-white/80 hover:bg-white hover:text-gray-900',
                    'rounded-md shadow-sm',
                    'opacity-0 group-hover:opacity-100 transition-all z-10 in-[.tour-active]:opacity-100'
                )}
                title="Enlarge visualization"
            >
                <ArrowsPointingOutIcon className="h-5 w-5" />
            </button>

            <VisualizerContainer
                recommendations={recommendations}
                Visualizer={Visualizer}
                xCol={xCol || ''}
                yCol={yCol || ''}
                onHover={handleHover}
                onInteract={(event, data, id) => trackEvent(event, data, id)}
                isFisheye={isFisheye}
            />

            <Dialog open={isFullScreen} onClose={() => setIsFullScreen(false)} className="relative z-50">
                <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <DialogPanel
                        className="w-full h-full bg-white rounded-xl shadow-xl overflow-hidden flex flex-col"
                        onClick={() => setSelectedMovie(undefined)}
                        onMouseMove={handleMouseMove}
                        data-testid="fullscreen-panel"
                        id="fullscreen-modal-panel"
                    >
                        <div
                            className={`flex-1 relative w-full overflow-hidden ${infoPanelLayout === 'sidebar' ? 'flex flex-row' : 'flex flex-col'}`}
                        >
                            <div
                                className={`relative ${infoPanelLayout === 'sidebar' ? 'w-3/4 h-full' : 'w-full h-full'}`}
                            >
                                {rightPanelProps && infoPanelLayout === 'overlay' && (
                                    <div
                                        className={`absolute top-4 z-20 w-96 max-h-[90vh] overflow-y-auto shadow-2xl rounded-xl border border-gray-200 group/panel transition-all duration-200 ${panelPosition === 'right' ? 'right-4' : 'left-4'}`}
                                        onClick={(e) => e.stopPropagation()}
                                        id="info-panel-overlay"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setSelectedMovie(undefined)}
                                            className="absolute top-2 right-2 p-1 text-gray-400 bg-white/50 hover:bg-white hover:text-gray-900 rounded-full z-30 opacity-0 group-hover/panel:opacity-100 transition-opacity"
                                        >
                                            <XMarkIcon className="h-5 w-5" />
                                            ''
                                        </button>
                                        <div className="bg-white rounded-xl p-1">
                                            <RightInfoPanel {...rightPanelProps} />
                                        </div>
                                    </div>
                                )}

                                <VisualizerContainer
                                    recommendations={recommendations}
                                    Visualizer={Visualizer}
                                    xCol={xCol || ''}
                                    yCol={yCol || ''}
                                    onHover={handleHover}
                                    onInteract={(event, data, id) => trackEvent(event, data, id)}
                                    isFisheye={isFisheye}
                                />
                            </div>

                            {rightPanelProps && infoPanelLayout === 'sidebar' && (
                                <div
                                    className="w-1/4 h-full border-l border-gray-200 bg-gray-50 flex flex-col overflow-hidden"
                                    onClick={(e) => e.stopPropagation()}
                                    id="info-panel-sidebar"
                                >
                                    <div className="flex-1 overflow-y-auto p-4">
                                        <RightInfoPanel {...rightPanelProps} />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div
                            className="h-14 border-t border-gray-200 bg-gray-50 flex justify-end items-center px-4 shrink-0"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                type="button"
                                id="viz-exit-fullscreen-btn"
                                onClick={() => setIsFullScreen(false)}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Exit Full Screen
                            </button>
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>
        </div>
    );
};

export default ConditionView;

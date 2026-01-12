import { Dialog, DialogPanel } from '@headlessui/react';
import { ArrowsPointingOutIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useStudy } from 'rssa-api';
import { LoadingScreen } from 'rssa-study-template';
import { useMovieSelection } from '../../hooks/useMovieSelection';
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
import { type StudyLayoutContextType } from '../../types/study.types';
import ResponsiveContainer from './ResponsiveContainer';
import RightInfoPanel from './RightInfoPanel';
import { type Movie } from '../../types/rssa.types';

import { useTour } from '../../hooks/useTour';

type ConditionViewProps = {
    Visualizer:
        | React.FC<PreferenceVizComponentProps<PreferenceVizRecommendedItem>>
        | React.FC<PreferenceVizComponentProps<Movie>>;
    recommendationType?: RecommendationType;
    rightPanelProps?: {
        likeCutoff: number;
        dislikeCutoff: number;
        showLikeDislikeByLine: boolean;
    };
    infoPanelLayout?: 'overlay' | 'sidebar';
    isFisheye?: boolean;
    onDataLoaded?: () => void;
    onFullScreenChange?: (isFullScreen: boolean) => void;
};

const ConditionView: React.FC<ConditionViewProps> = ({
    Visualizer,
    recommendationType,
    rightPanelProps,
    infoPanelLayout = 'overlay',
    isFisheye,
    onDataLoaded,
    onFullScreenChange,
}) => {
    const { studyStep } = useOutletContext<StudyLayoutContextType>();
    const { studyApi } = useStudy();
    const { setSelectedMovie } = useMovieSelection<PreferenceVizRecommendedItem | Movie>();
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [panelPosition, setPanelPosition] = useState<'left' | 'right'>('right');
    const { startFullscreenTour } = useTour();
    const tourStartedRef = useRef(false);

    useEffect(() => {
        if (onFullScreenChange) {
            onFullScreenChange(isFullScreen);
        }
        if (isFullScreen) {
            if (!tourStartedRef.current) {
                tourStartedRef.current = true;
                // Short delay to allow modal to open and render
                setTimeout(() => {
                    startFullscreenTour();
                }, 500);
            }
        }
    }, [isFullScreen, startFullscreenTour, onFullScreenChange]);

    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            if (infoPanelLayout !== 'overlay') return;

            const x = e.clientX;
            const threshold = window.innerWidth / 2;
            if (x > threshold) {
                setPanelPosition('left');
            } else {
                setPanelPosition('right');
            }
        },
        [infoPanelLayout]
    );

    const { data: recommendations, isLoading: recommendationsLoading } = useQuery({
        queryKey: ['recommendations', studyStep.id],
        queryFn: async () => {
            const payload: RecommendationRequestPayload = {
                step_id: studyStep.id,
                context_tag: 'preference visualization recommendations',
                rec_type: recommendationType,
            };

            const response = await studyApi.post<RecommendationRequestPayload, BackendResponsePayload>(
                'recommendations/',
                payload
            );

            if (!response) {
                throw new Error('Failed to fetch recommendations');
            }

            const adaptedResponse: PreferenceVizResponseObject = {};

            if (response.rec_type === 'standard') {
                Object.entries(response.items).forEach(([key, value]) => {
                    adaptedResponse[key] = value as Movie;
                });
            }

            if (response.rec_type === 'community_comparison') {
                Object.entries(response.items).forEach(([key, value]) => {
                    const { item, score, label, ...rest } = value as BackendCommunityScoreItem;
                    if (item && typeof item === 'object') {
                        const itemId = item.id;
                        adaptedResponse[itemId] = {
                            ...item, // Spread all movie properties
                            ...rest, // Spread community_score, community_label, cluster
                            item_id: itemId, // Ensure item_id matches the key
                            user_score: score, // Map score -> user_score
                            user_label: label, // Map label -> user_label
                        };
                    } else {
                        console.warn(`Unexpected item structure for key ${key}:`, value);
                    }
                });
            }

            return adaptedResponse;
        },
    });

    const handleHover = useCallback(
        (item_id: string) => {
            const selectedMovie = recommendations ? recommendations[item_id] : undefined;
            if (selectedMovie) {
                setSelectedMovie(selectedMovie);
            }
            // CRITICAL: Do NOT add 'else { setSelectedMovie(undefined) }' here.
            // Clearing state on mouseout/empty ID triggers context update -> re-render -> D3 wipe -> mouseout loop.
        },
        [recommendations, setSelectedMovie]
    );

    // Trigger onDataLoaded when recommendations are ready
    useEffect(() => {
        if (!recommendationsLoading && recommendations) {
            // Auto-select the first movie if none is selected, to ensure RightInfoPanel renders
            const firstMovieKey = Object.keys(recommendations)[0];
            if (firstMovieKey) {
                const firstMovie = recommendations[firstMovieKey];
                if (firstMovie) {
                    setSelectedMovie(firstMovie);
                }
            }

            if (onDataLoaded) {
                onDataLoaded();
            }
        }
    }, [recommendationsLoading, recommendations, onDataLoaded, setSelectedMovie]);

    if (recommendationsLoading || !recommendations) {
        return <LoadingScreen loading={true} message="Loading Recommendations" />;
    }

    return (
        <div className="relative w-full h-full group" id="condition-view-container">
            {/* Enlarge Button */}
            <button
                type="button"
                id="viz-enlarge-btn"
                onClick={() => setIsFullScreen(true)}
                className="absolute top-2 right-2 p-1.5 text-gray-400 bg-white/80 hover:bg-white hover:text-gray-900 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-all z-10"
                title="Enlarge visualization"
            >
                <ArrowsPointingOutIcon className="h-5 w-5" />
            </button>

            <ResponsiveContainer>
                {(width, height) => {
                    const firstItem = Object.values(recommendations)[0];
                    if (!firstItem) return null; // Or some fallback

                    if (isPreferenceVizRecommendedItem(firstItem)) {
                        const SpecificVisualizer = Visualizer as React.FC<
                            PreferenceVizComponentProps<PreferenceVizRecommendedItem>
                        >;
                        const specificData = recommendations as Record<string, PreferenceVizRecommendedItem>;
                        return (
                            <SpecificVisualizer
                                width={width}
                                height={height}
                                data={specificData}
                                xCol=""
                                yCol=""
                                onHover={handleHover}
                                isFisheye={isFisheye}
                            />
                        );
                    } else {
                        const SpecificVisualizer = Visualizer as React.FC<PreferenceVizComponentProps<Movie>>;
                        const specificData = recommendations as Record<string, Movie>;
                        return (
                            <SpecificVisualizer
                                width={width}
                                height={height}
                                data={specificData}
                                xCol=""
                                yCol=""
                                onHover={handleHover}
                                isFisheye={isFisheye}
                            />
                        );
                    }
                }}
            </ResponsiveContainer>

            {/* Full Screen Modal */}
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
                            {/* Visualization Area */}
                            <div
                                className={`relative ${infoPanelLayout === 'sidebar' ? 'w-3/4 h-full' : 'w-full h-full'}`}
                            >
                                {/* Floating Right Info Panel (Overlay Mode) */}
                                {rightPanelProps && infoPanelLayout === 'overlay' && (
                                    <div
                                        className={`absolute top-4 z-20 w-96 max-h-[90vh] overflow-y-auto shadow-2xl rounded-xl border border-gray-200 group/panel transition-all duration-200 ${
                                            panelPosition === 'right' ? 'right-4' : 'left-4'
                                        }`}
                                        onClick={(e) => e.stopPropagation()}
                                        data-testid="info-panel-wrapper"
                                        id="info-panel-overlay"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setSelectedMovie(undefined)}
                                            className="absolute top-2 right-2 p-1 text-gray-400 bg-white/50 hover:bg-white hover:text-gray-900 rounded-full z-30 opacity-0 group-hover/panel:opacity-100 transition-opacity"
                                            title="Close info panel"
                                        >
                                            <XMarkIcon className="h-5 w-5" />
                                        </button>
                                        <div className="bg-white rounded-xl p-1">
                                            <RightInfoPanel
                                                likeCutoff={rightPanelProps.likeCutoff}
                                                dislikeCutoff={rightPanelProps.dislikeCutoff}
                                                showLikeDislikeByLine={rightPanelProps.showLikeDislikeByLine}
                                            />
                                        </div>
                                    </div>
                                )}

                                <ResponsiveContainer>
                                    {(width, height) => {
                                        const firstItem = Object.values(recommendations)[0];
                                        if (!firstItem) return null;

                                        if (isPreferenceVizRecommendedItem(firstItem)) {
                                            const SpecificVisualizer = Visualizer as React.FC<
                                                PreferenceVizComponentProps<PreferenceVizRecommendedItem>
                                            >;
                                            const specificData = recommendations as Record<
                                                string,
                                                PreferenceVizRecommendedItem
                                            >;
                                            return (
                                                <SpecificVisualizer
                                                    width={width}
                                                    height={height}
                                                    data={specificData}
                                                    xCol=""
                                                    yCol=""
                                                    onHover={handleHover}
                                                    isFisheye={isFisheye}
                                                />
                                            );
                                        } else {
                                            const SpecificVisualizer = Visualizer as React.FC<
                                                PreferenceVizComponentProps<Movie>
                                            >;
                                            const specificData = recommendations as Record<string, Movie>;
                                            return (
                                                <SpecificVisualizer
                                                    width={width}
                                                    height={height}
                                                    data={specificData}
                                                    xCol=""
                                                    yCol=""
                                                    onHover={handleHover}
                                                    isFisheye={isFisheye}
                                                />
                                            );
                                        }
                                    }}
                                </ResponsiveContainer>
                            </div>

                            {/* Sidebar Info Panel (Sidebar Mode) */}
                            {rightPanelProps && infoPanelLayout === 'sidebar' && (
                                <div
                                    className="w-1/4 h-full border-l border-gray-200 bg-gray-50 flex flex-col overflow-hidden"
                                    onClick={(e) => e.stopPropagation()}
                                    id="info-panel-sidebar"
                                >
                                    <div className="flex-1 overflow-y-auto p-4">
                                        <RightInfoPanel
                                            likeCutoff={rightPanelProps.likeCutoff}
                                            dislikeCutoff={rightPanelProps.dislikeCutoff}
                                            showLikeDislikeByLine={rightPanelProps.showLikeDislikeByLine}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div
                            className="h-14 border-t border-gray-200 bg-gray-50 flex justify-end items-center px-4 shrink-0"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                type="button"
                                id="viz-exit-fullscreen-btn"
                                onClick={() => setIsFullScreen(false)}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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

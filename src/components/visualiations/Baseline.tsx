import { useEffect, useRef } from 'react';
import type { PreferenceVizComponentProps } from '../../types/preferenceVisualization.types';
import type { Movie } from '@rssa-project/study-template';

const posterHeight = 81;

const BaselineMovieItem: React.FC<{
    item: Movie;
    onHover: (item: string) => void;
    onInteract?: PreferenceVizComponentProps<Movie>['onInteract'];
}> = ({ item, onHover, onInteract }) => {
    const hoverStartTimeRef = useRef<number | null>(null);

    const handleMouseEnter = () => {
        hoverStartTimeRef.current = performance.now();
        onHover(item.id);
    };

    const handleMouseLeave = () => {
        if (hoverStartTimeRef.current !== null) {
            const durationMs = Math.round(performance.now() - hoverStartTimeRef.current);
            if (durationMs > 500 && onInteract) {
                onInteract('item_hover_duration', { duration_ms: durationMs }, item.id);
            }
            hoverStartTimeRef.current = null;
        }
    };

    useEffect(() => {
        return () => {
            if (hoverStartTimeRef.current !== null) {
                const durationMs = Math.round(performance.now() - hoverStartTimeRef.current);
                if (durationMs > 500 && onInteract) {
                    onInteract('item_hover_duration', { duration_ms: durationMs, unmounted: true }, item.id);
                }
            }
        };
    }, [onInteract, item.id]);

    return (
        <div className="flex gap-3 shadow-sm p-1" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <img className="h-45" src={item.poster} height={posterHeight} alt={item.title} />
            {/* <div>
                <div className="flex gap-1">
                    <p className="text-base">{item.title}</p>
                    <p className="text-base">({item.year})</p>
                </div>
                <p className="mt-3 text-sm text-left">{item.description}</p>
            </div> */}
        </div>
    );
};

const Baseline: React.FC<PreferenceVizComponentProps<Movie>> = ({ data, onHover, onInteract }) => {
    return (
        <div className="m-3 gap-1 overflow-x-auto" style={{ maxHeight: '900px' }}>
            {Object.entries(data).map(([k, item]) => (
                <BaselineMovieItem key={`rec-movies-${k}`} item={item} onHover={onHover} onInteract={onInteract} />
            ))}
        </div>
    );
};

export default Baseline;

import type { PreferenceVizComponentProps } from '../../types/preferenceVisualization.types';
import type { Movie } from '../../types/rssa.types';

const posterHeight = 81;

const Baseline: React.FC<PreferenceVizComponentProps<Movie>> = ({ data, onHover }) => {
    return (
        <div className="m-3 gap-1 overflow-x-auto" style={{ maxHeight: '900px' }}>
            {Object.entries(data).map(([k, item]: [string, Movie]) => (
                <div
                    key={`{rec}-movies-${k}`}
                    className="flex gap-3 shadow-sm p-1"
                    onMouseOver={() => onHover(item.id)}
                >
                    <img className="h-[180px]" src={item.poster} height={posterHeight} alt={item.title} />
                    {/* <div>
                        <div className="flex gap-1">
                            <p className="text-base">{item.title}</p>
                            <p className="text-base">({item.year})</p>
                        </div>
                        <p className="mt-3 text-sm text-left">{item.description}</p>
                    </div> */}
                </div>
            ))}
        </div>
    );
};

export default Baseline;

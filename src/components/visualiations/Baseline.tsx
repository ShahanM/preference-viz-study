import type {
    PreferenceVizComponentProps,
    PreferenceVizRecommendedItem,
} from '../../types/preferenceVisualization.types';

const posterHeight = 81;

const Baseline: React.FC<PreferenceVizComponentProps> = ({ data, onHover }) => {

    return (
        <div className="m-3 gap-1 overflow-x-auto" style={{ maxHeight: '900px' }}>
            {Object(data).map((k: string, item: PreferenceVizRecommendedItem) => (
                <div
                    key={`{rec}-movies-${k}`}
                    className="baseline-item-div d-flex shadow-sm p-1"
                    onMouseOver={() => onHover(item.id)}
                >
                    <img className="baseline-image" src={item.poster} height={posterHeight} alt={item.title} />
                    <p className="fw-medium ms-3">{item.title}</p>
                </div>
            ))}
        </div>
    );
};

export default Baseline;

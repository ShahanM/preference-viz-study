import * as d3 from 'd3';
import { useEffect, useMemo, useRef } from 'react';
import type {
    PreferenceVizComponentProps,
    PreferenceVizRecommendedItem,
} from '../../types/preferenceVisualization.types';
import { DISLIKE_CUTOFF, LIKE_CUTOFF } from '../../utils/constants';
import { POSTER_HEIGHT, POSTER_WIDTH } from '../../utils/vizConstants';
import { appendStyledPoster, attachNodeInteractions, fisheye, PADDING } from '../../utils/vizUtils';

const likeCuttoff = LIKE_CUTOFF;
const dislikeCuttoff = DISLIKE_CUTOFF;
const margin = { top: 20, right: 20, bottom: 30, left: 40 };
const rowHeaderWidth = 30; // Reduced from 100 to give more space
const colHeaderHeight = 30; // Reduced from 100

const DiscreteCoupled: React.FC<PreferenceVizComponentProps<PreferenceVizRecommendedItem>> = ({
    width,
    height,
    data,
    onHover,
    isFisheye = false,
}) => {
    const svgRefs = useRef<SVGSVGElement[]>([]);

    // Stable refs for interactions
    const onHoverRef = useRef(onHover);
    useEffect(() => {
        onHoverRef.current = onHover;
    }, [onHover]);

    const stickyIdRef = useRef<string | null>(null);

    const dataValues = useMemo(() => (data ? Object.values(data) : []), [data]);

    // Split data into 4 quadrants
    const filteredData = useMemo(() => {
        return {
            myLikesCommLike: dataValues.filter((d) => d.user_score >= likeCuttoff && d.community_score >= likeCuttoff),
            myDislikesCommLikes: dataValues.filter(
                (d) => d.user_score < dislikeCuttoff && d.community_score >= likeCuttoff
            ),
            myLikesCommDislikes: dataValues.filter(
                (d) => d.user_score >= likeCuttoff && d.community_score < dislikeCuttoff
            ),
            myDislikesCommDislikes: dataValues.filter(
                (d) => d.user_score < dislikeCuttoff && d.community_score < dislikeCuttoff
            ),
        };
    }, [dataValues]);

    useEffect(() => {
        if (!width || !height) return;

        // Calculate available space for the quadrants
        const availableWidth = width - rowHeaderWidth - margin.left - margin.right;
        const availableHeight = height - colHeaderHeight - margin.top - margin.bottom;

        const quadrantWidth = availableWidth / 2;
        const quadrantHeight = availableHeight / 2;

        const dataArrays = Object.values(filteredData);

        const totalPosterW = POSTER_WIDTH + PADDING * 2;
        const totalPosterH = POSTER_HEIGHT + PADDING * 2;

        svgRefs.current.forEach((svgRef, i) => {
            if (!svgRef) return;
            const quadrantData = dataArrays[i];

            const svg = d3.select(svgRef).attr('width', quadrantWidth).attr('height', quadrantHeight);

            svg.selectAll('*').remove();

            // Background rect for events
            const bg = svg
                .append('rect')
                .attr('width', quadrantWidth)
                .attr('height', quadrantHeight)
                .attr('fill', 'transparent');

            // Click bg to clear sticky
            bg.on('click', () => {
                if (stickyIdRef.current) {
                    // Reset visual state of all nodes globally (simplest safety)
                    d3.selectAll<SVGGElement, unknown>('.movie-node').each(function () {
                        const content = d3.select(this).select('.node-content');
                        content.transition().duration(200).attr('transform', 'translate(0,0) scale(1)');
                        content.select('rect').style('filter', 'drop-shadow(0px 2px 4px rgba(0,0,0,0.3))');
                    });
                    stickyIdRef.current = null;
                    if (onHoverRef.current) onHoverRef.current('');
                }
            });

            // Calculate Grid Layout
            // We want to pack items into the quadrantWidth/Height
            // Columns = floor(quadrantWidth / (totalPosterW + gap))
            const CONTAINER_PADDING = 10;
            const usableWidth = quadrantWidth - 2 * CONTAINER_PADDING;
            const usableHeight = quadrantHeight - 2 * CONTAINER_PADDING;

            // Calculate optimal columns to match aspect ratio
            // targetRatio = usableWidth / usableHeight
            // currentRatio = (cols * w) / (rows * h)
            const count = quadrantData.length;
            const posterRatio = POSTER_WIDTH / POSTER_HEIGHT; // ~0.66
            const viewRatio = usableWidth / usableHeight;

            // Heuristic for cols: sqrt(N * viewRatio / posterRatio)
            // This attempts to make the grid shape match the view shape
            let cols = Math.ceil(Math.sqrt((count * viewRatio) / posterRatio));
            // Clamp cols to reasonable bounds
            cols = Math.max(1, Math.min(count, cols));
            const rows = Math.ceil(count / cols);

            // Calculate spacings (allowing overlap)
            // If cols=1, stepX is unused (center it). If cols>1, stepX distributes available space.
            // stepX = (usableWidth - POSTER_WIDTH) / (cols - 1)

            const stepX = cols > 1 ? (usableWidth - POSTER_WIDTH) / (cols - 1) : 0;
            const stepY = rows > 1 ? (usableHeight - POSTER_HEIGHT) / (rows - 1) : 0;

            const nodesGroup = svg.append('g');

            const nodes = nodesGroup
                .selectAll<SVGGElement, PreferenceVizRecommendedItem & { x: number; y: number }>('.movie-node')
                .data(quadrantData as (PreferenceVizRecommendedItem & { x: number; y: number })[])
                .enter()
                .append('g')
                .attr('class', (d) => `movie-node node-id-${d.id}`)
                .attr('transform', (d, idx) => {
                    const row = Math.floor(idx / cols);
                    const col = idx % cols;

                    let x, y;

                    if (cols === 1) {
                        x = CONTAINER_PADDING + usableWidth / 2;
                    } else {
                        x = CONTAINER_PADDING + POSTER_WIDTH / 2 + col * stepX;
                    }

                    if (rows === 1) {
                        y = CONTAINER_PADDING + usableHeight / 2;
                    } else {
                        y = CONTAINER_PADDING + POSTER_HEIGHT / 2 + row * stepY;
                    }

                    // Attach calculated position for later reference
                    d.x = x;
                    d.y = y;

                    return `translate(${x}, ${y})`;
                })
                .attr('data-ox', (d) => d.x)
                .attr('data-oy', (d) => d.y);

            // Hit Area
            nodes
                .append('rect')
                .attr('class', 'hit-area')
                .attr('width', totalPosterW)
                .attr('height', totalPosterH)
                .attr('x', -totalPosterW / 2)
                .attr('y', -totalPosterH / 2)
                .attr('fill', 'transparent');

            // Attach Interactions
            attachNodeInteractions(nodes, {
                onHoverRef,
                stickyIdRef,
                posterWidth: POSTER_WIDTH,
                posterHeight: POSTER_HEIGHT,
                innerWidth: quadrantWidth,
                innerHeight: quadrantHeight,
                scaleFactor: 1.5,
            });

            // Content
            const content = nodes.append('g').attr('class', 'node-content');
            const { image } = appendStyledPoster(content, POSTER_WIDTH, POSTER_HEIGHT);
            image.attr('xlink:href', (d: PreferenceVizRecommendedItem) => d.tmdb_poster);

            // Fisheye Logic
            if (isFisheye) {
                svg.on('mousemove', (event) => {
                    const [mx, my] = d3.pointer(event);

                    // Only distort if inside bounds (padding)
                    if (mx < 0 || mx > quadrantWidth || my < 0 || my > quadrantHeight) return;

                    const df = 3.0;

                    nodes.each(function () {
                        const ox = parseFloat(d3.select(this).attr('data-ox'));
                        const oy = parseFloat(d3.select(this).attr('data-oy'));

                        const nx = fisheye(ox, mx, df, 0, quadrantWidth);
                        const ny = fisheye(oy, my, df, 0, quadrantHeight);

                        d3.select(this).attr('transform', `translate(${nx}, ${ny})`);
                    });
                });

                svg.on('mouseleave', () => {
                    nodes.each(function () {
                        const ox = d3.select(this).attr('data-ox');
                        const oy = d3.select(this).attr('data-oy');
                        d3.select(this).attr('transform', `translate(${ox}, ${oy})`);
                    });
                });
            }
        });
    }, [width, height, filteredData, isFisheye]);

    const setSvgRef = (index: number) => (element: SVGSVGElement | null) => {
        if (element) svgRefs.current[index] = element;
    };

    return (
        <div className="flex w-full h-full">
            {/* Y Axis Label Area */}
            <div className="flex flex-col justify-center items-center" style={{ width: '30px' }}>
                <p
                    style={{
                        writingMode: 'vertical-rl',
                        transform: 'rotate(180deg)',
                        margin: '0 auto 100px 0',
                        paddingTop: '512px',
                        whiteSpace: 'nowrap',
                        fontWeight: 'bold',
                        textAlign: 'center',
                    }}
                >
                    Me
                </p>
            </div>

            <div className="flex-1 flex flex-col">
                <div className="flex flex-col flex-1">
                    {/* Column Headers */}
                    <div className="flex flex-row h-8">
                        <div className="w-8"></div> {/* Spacer for row headers */}
                        <div className="flex-1 flex items-center justify-center font-bold">Likes</div>
                        <div className="flex-1 flex items-center justify-center font-bold">Dislikes</div>
                    </div>

                    <div className="flex-1 flex flex-row">
                        {/* Row Headers */}
                        <div className="w-8 flex flex-col">
                            <div
                                className="flex-1 flex items-center justify-center font-bold"
                                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                            >
                                Likes
                            </div>
                            <div
                                className="flex-1 flex items-center justify-center font-bold"
                                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                            >
                                Dislikes
                            </div>
                        </div>

                        {/* Grid Content */}
                        <div className="flex-1 flex flex-col">
                            {/* Top Row */}
                            <div className="flex-1 flex flex-row">
                                <div className="flex-1 border border-gray-300 relative">
                                    <svg ref={setSvgRef(0)} className="absolute inset-0 w-full h-full"></svg>
                                </div>
                                <div className="flex-1 border border-gray-300 relative">
                                    <svg ref={setSvgRef(2)} className="absolute inset-0 w-full h-full"></svg>
                                </div>
                            </div>
                            {/* Bottom Row */}
                            <div className="flex-1 flex flex-row">
                                <div className="flex-1 border border-gray-300 relative">
                                    <svg ref={setSvgRef(1)} className="absolute inset-0 w-full h-full"></svg>
                                </div>
                                <div className="flex-1 border border-gray-300 relative">
                                    <svg ref={setSvgRef(3)} className="absolute inset-0 w-full h-full"></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* X Axis Label */}
                <div className="h-8 flex items-center justify-center font-bold">Everyone else</div>
            </div>
        </div>
    );
};

export default DiscreteCoupled;

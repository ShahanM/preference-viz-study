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
const margin = { top: 20, right: 20, bottom: 30, left: 40 }; // Define margins
const rowHeaderWidth = 100;
const colHeaderHeight = 100;
// const numRows = 2; // Removed unused
const numCols = 2;

interface DiscreteData {
    myLikes: PreferenceVizRecommendedItem[];
    myDislikes: PreferenceVizRecommendedItem[];
    commLikes: PreferenceVizRecommendedItem[];
    commDislikes: PreferenceVizRecommendedItem[];
}

const DiscreteDecoupled: React.FC<PreferenceVizComponentProps<PreferenceVizRecommendedItem>> = ({
    width,
    height,
    data,
    onHover,
    isFisheye = false,
    showCommunity = true,
}) => {
    const svgRefs = useRef<Map<keyof DiscreteData, SVGSVGElement>>(new Map());

    // Stable refs for interactions
    const onHoverRef = useRef(onHover);
    useEffect(() => {
        onHoverRef.current = onHover;
    }, [onHover]);

    const stickyIdRef = useRef<string | null>(null);

    const filteredData = useMemo(() => {
        if (!data) return null;
        const dataArr = Object.values(data);
        const result = {
            myLikes: dataArr.filter((d) => d.user_score >= likeCuttoff),
            myDislikes: dataArr.filter((d) => d.user_score < dislikeCuttoff),
        } as DiscreteData;

        if (showCommunity) {
            result.commLikes = dataArr.filter((d) => d.community_score >= likeCuttoff);
            result.commDislikes = dataArr.filter((d) => d.community_score < dislikeCuttoff);
        }

        return result;
    }, [data, showCommunity]);

    useEffect(() => {
        if (!filteredData || width === 0 || height === 0) return;

        const effectiveNumRows = showCommunity ? 2 : 1;

        const innerWidth = width - rowHeaderWidth - margin.left - margin.right;
        const innerHeight = height - colHeaderHeight - margin.top - margin.bottom;
        const svgWidth = innerWidth / numCols;
        const svgHeight = innerHeight / effectiveNumRows;

        const totalPosterW = POSTER_WIDTH + PADDING * 2;
        const totalPosterH = POSTER_HEIGHT + PADDING * 2;

        svgRefs.current.forEach((svgRef, svgKey) => {
            if (!svgRef) return;

            // Skip rendering if key is for community and we are not showing community
            if (!showCommunity && (svgKey === 'commLikes' || svgKey === 'commDislikes')) return;

            const svg = d3.select(svgRef).attr('width', svgWidth).attr('height', svgHeight);
            svg.selectAll('*').remove();

            // Background rect for resetting global sticky state
            const bg = svg.append('rect').attr('width', svgWidth).attr('height', svgHeight).attr('fill', 'transparent');

            // Click bg to clear sticky
            bg.on('click', () => {
                if (stickyIdRef.current) {
                    // Reset visual state of all nodes globally
                    d3.selectAll('.movie-node').each(function () {
                        const content = d3.select(this).select('.node-content');
                        content.transition().duration(200).attr('transform', 'translate(0,0) scale(1)');
                        content.select('rect').style('filter', 'drop-shadow(0px 2px 4px rgba(0,0,0,0.3))');
                    });
                    stickyIdRef.current = null;
                    if (onHoverRef.current) onHoverRef.current('');
                }
            });

            const g = svg.append<SVGGElement>('g').attr('transform', `translate(${margin.left},${margin.top})`);

            // Using margin 0 for internal SVG content simplifies things for these small boxes.
            g.attr('transform', 'translate(0,0)');
            const quadrantWidth = svgWidth;
            const quadrantHeight = svgHeight;

            const ctxData = filteredData[svgKey];
            if (!ctxData) return;

            // ---------------------------
            // Dynamic Grid Layout Logic
            // ---------------------------
            const CONTAINER_PADDING = 10;
            const usableWidth = quadrantWidth - 2 * CONTAINER_PADDING;
            const usableHeight = quadrantHeight - 2 * CONTAINER_PADDING;

            // Calculate optimal columns to match aspect ratio
            const count = ctxData.length;
            const posterRatio = POSTER_WIDTH / POSTER_HEIGHT; // ~0.66
            const viewRatio = usableWidth / usableHeight;

            // Heuristic for cols: sqrt(N * viewRatio / posterRatio)
            let cols = Math.ceil(Math.sqrt((count * viewRatio) / posterRatio));
            cols = Math.max(1, Math.min(count, cols));
            const rows = Math.ceil(count / cols);

            // Calculate spacings (allowing overlap if needed)
            const stepX = cols > 1 ? (usableWidth - POSTER_WIDTH) / (cols - 1) : 0;
            const stepY = rows > 1 ? (usableHeight - POSTER_HEIGHT) / (rows - 1) : 0;

            const nodesGroup = g.append('g');

            const nodes = nodesGroup
                .selectAll('.movie-node')
                .data(ctxData as (PreferenceVizRecommendedItem & { x: number; y: number })[])
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

                    // Attach calculated position
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
            image.attr('xlink:href', (d) => d.tmdb_poster);

            // Fisheye Logic
            if (isFisheye) {
                svg.on('mousemove', (event) => {
                    const [mx, my] = d3.pointer(event);

                    // Padding check
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
    }, [width, height, filteredData, onHover, isFisheye, showCommunity]);

    const setSvgRef = (key: keyof DiscreteData) => (element: SVGSVGElement | null) => {
        svgRefs.current.set(key, element!);
    };

    return (
        <div
            className={`grid ${showCommunity ? 'grid-rows-2' : 'grid-rows-1'} gap-5 font-medium`}
            style={{ width, height }}
        >
            <div className="flex flex-col h-full overflow-hidden">
                <div className="grid grid-cols-2 gap-0 flex-1 min-h-0">
                    <div className="border rounded-tl-md border-amber-300 relative w-full h-full overflow-hidden">
                        <svg ref={setSvgRef('myDislikes')} className="w-full h-full"></svg>
                        <div className="absolute top-0 left-0 bg-gray-300 px-2 py-0.5 text-xs z-10">Dislikes</div>
                    </div>
                    <div className="border rounded-tr-md border-amber-300 relative w-full h-full overflow-hidden">
                        <svg ref={setSvgRef('myLikes')} className="w-full h-full"></svg>
                        <div className="absolute top-0 left-0 bg-gray-300 px-2 py-0.5 text-xs z-10">Likes</div>
                    </div>
                </div>
                <p className="pt-3 bg-amber-300 rounded-b-md z-10 relative">
                    The system's predicted movie rating for you
                </p>
            </div>

            {showCommunity && (
                <div className="flex flex-col h-full overflow-hidden">
                    <div className="grid grid-cols-2 gap-0 flex-1 min-h-0">
                        <div className="border rounded-tl-md border-amber-300 relative w-full h-full overflow-hidden">
                            <svg ref={setSvgRef('commDislikes')} className="w-full h-full"></svg>
                            <div className="absolute top-0 left-0 bg-gray-300 px-2 py-0.5 text-xs z-10">Dislikes</div>
                        </div>
                        <div className="border rounded-tr-md border-amber-300 relative w-full h-full overflow-hidden">
                            <svg ref={setSvgRef('commLikes')} className="w-full h-full"></svg>
                            <div className="absolute top-0 left-0 bg-gray-300 px-2 py-0.5 text-xs z-10">Likes</div>
                        </div>
                    </div>
                    <p className="pt-3 bg-amber-300 rounded-b-md z-10 relative">
                        Ratings from everyone else in the system
                    </p>
                </div>
            )}
        </div>
    );
};

export default DiscreteDecoupled;

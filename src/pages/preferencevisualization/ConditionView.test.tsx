// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

expect.extend(matchers);
import ConditionView from './ConditionView';
import { type PreferenceVizComponentProps } from '../../types/preferenceVisualization.types';

// Mock ResizeObserver
// Mock ResizeObserver
globalThis.ResizeObserver = class ResizeObserver {
    callback: ResizeObserverCallback;

    constructor(callback: ResizeObserverCallback) {
        this.callback = callback;
    }

    observe(_target: Element) {
        // Trigger callback immediately
        this.callback([{ contentRect: { width: 800, height: 600 } } as ResizeObserverEntry], this);
    }
    unobserve() {}
    disconnect() {}
};

// Mock dependencies
const mockStudyStep = { id: 'step-123' };
const mockStudyApi = {
    post: vi.fn(),
    get: vi.fn(),
};
const mockSetSelectedMovie = vi.fn();

// Mock useOutletContext
vi.mock('react-router-dom', () => ({
    useOutletContext: () => ({ studyStep: mockStudyStep }),
}));

// Mock useStudy
vi.mock('rssa-api', () => ({
    useStudy: () => ({ studyApi: mockStudyApi }),
}));

// Mock useMovieSelection
vi.mock('../../hooks/useMovieSelection', () => ({
    useMovieSelection: () => ({ setSelectedMovie: mockSetSelectedMovie }),
}));

// Mock RightInfoPanel
vi.mock('./RightInfoPanel', () => ({
    default: ({ likeCutoff, dislikeCutoff }: any) => (
        <div data-testid="right-info-panel">
            Right Panel: {likeCutoff}/{dislikeCutoff}
        </div>
    ),
}));

// Dummy Visualizer
const MockVisualizer: React.FC<PreferenceVizComponentProps> = ({ width, height, onHover }) => (
    <div data-testid="visualizer" style={{ width, height }} onClick={() => onHover && onHover('1')}>
        Visualizer Content
    </div>
);

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: false, staleTime: 0 },
    },
});

describe('ConditionView Full Screen', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        queryClient.clear();
        mockStudyApi.post.mockResolvedValue({
            '1': { item: { id: '1', title: 'Test Movie' }, score: 5, label: 'Liked' },
        });

        // Mock getBoundingClientRect for initial load
        Element.prototype.getBoundingClientRect = vi.fn(() => ({
            width: 800,
            height: 600,
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            x: 0,
            y: 0,
            toJSON: () => {},
        }));
    });

    afterEach(() => {
        cleanup();
    });

    const renderComponent = (props: any = {}) => {
        return render(
            <QueryClientProvider client={queryClient}>
                <div style={{ width: 800, height: 600 }}>
                    <ConditionView Visualizer={MockVisualizer} {...props} />
                </div>
            </QueryClientProvider>
        );
    };

    it('renders the enlarge button', async () => {
        renderComponent();
        await screen.findByTestId('visualizer'); // Wait for load
        const enlargeButton = screen.getByTitle('Enlarge visualization');
        expect(enlargeButton).toBeInTheDocument();
    });

    it('opens full screen modal when enlarge button is clicked', async () => {
        renderComponent();
        await screen.findByTestId('visualizer');

        const enlargeButton = screen.getByTitle('Enlarge visualization');
        fireEvent.click(enlargeButton);

        // Check for modal content
        // We look for the close button using the text we added
        const closeButton = await screen.findByText('Exit Full Screen');
        expect(closeButton).toBeInTheDocument();

        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();

        // We should now have two visualizers (one background, one in modal)
        const visualizers = screen.getAllByTestId('visualizer');
        expect(visualizers).toHaveLength(2);
    });

    it('renders RightInfoPanel in full screen when props are provided', async () => {
        renderComponent({
            rightPanelProps: {
                likeCutoff: 3,
                dislikeCutoff: 2,
                showLikeDislikeByLine: true,
            },
        });
        await screen.findByTestId('visualizer');

        const enlargeButton = screen.getByTitle('Enlarge visualization');
        fireEvent.click(enlargeButton);

        const rightPanel = await screen.findByTestId('right-info-panel');
        expect(rightPanel).toBeInTheDocument();
        expect(rightPanel).toHaveTextContent('Right Panel: 3/2');
    });

    it('closes full screen modal when close button is clicked', async () => {
        renderComponent();
        await screen.findByTestId('visualizer');

        const enlargeButton = screen.getByTitle('Enlarge visualization');
        fireEvent.click(enlargeButton);

        const closeButton = await screen.findByText('Exit Full Screen');
        fireEvent.click(closeButton);

        // We can check if close button is gone
        expect(screen.queryByText('Exit Full Screen')).not.toBeInTheDocument();
    });

    it('closes info panel when its close button is clicked', async () => {
        renderComponent({
            rightPanelProps: { likeCutoff: 3, dislikeCutoff: 2, showLikeDislikeByLine: true },
        });
        await screen.findByTestId('visualizer');

        // Open full screen
        fireEvent.click(screen.getByTitle('Enlarge visualization'));

        // Mock selection (which shows the panel)
        // Since we mocked RightInfoPanel to render if props are present, we need to ensure local state allows it?
        // Wait, current implementation only renders the wrapper if rightPanelProps is truthy.
        // It DOES NOT check if a movie is selected in the ConditionView TSX (it relies on RightInfoPanel to handle null selection or be always visible?)
        // Let's check ConditionView.tsx logic again.
        // Logic: {rightPanelProps && ( ... <RightInfoPanel ... /> ... )}
        // It always renders the wrapper if props are passed!
        // But RightInfoPanel internals likely hide if no movie selected?
        // Re-reading ConditionView.tsx: The wrapper is ALWAYS rendered if rightPanelProps is set.
        // So the close button is always there?
        // "onClick={() => setSelectedMovie(undefined)}"
        // If the wrapper is visible, the button is compatible.

        const closePanelButton = await screen.findByTitle('Close info panel');
        fireEvent.click(closePanelButton);

        expect(mockSetSelectedMovie).toHaveBeenCalledWith(undefined);
    });

    it('closes info panel when clicking background', async () => {
        renderComponent({
            rightPanelProps: { likeCutoff: 3, dislikeCutoff: 2, showLikeDislikeByLine: true },
        });
        await screen.findByTestId('visualizer');

        fireEvent.click(screen.getByTitle('Enlarge visualization'));

        // Click on the visualizer inside the modal (the second one)
        const visualizers = screen.getAllByTestId('visualizer');
        const modalVisualizer = visualizers[1]; // Index 1 is the one in the portal usually, or purely by order of render

        fireEvent.click(modalVisualizer);

        expect(mockSetSelectedMovie).toHaveBeenCalledWith(undefined);
    });
    it('moves info panel to the left when cursor is on the right', async () => {
        // Mock window.innerWidth
        window.innerWidth = 1000;

        renderComponent({
            rightPanelProps: { likeCutoff: 3, dislikeCutoff: 2, showLikeDislikeByLine: true },
        });
        await screen.findByTestId('visualizer');

        fireEvent.click(screen.getByTitle('Enlarge visualization'));

        const panelWrapper = screen.getByTestId('info-panel-wrapper');
        // Initial state: right-4
        expect(panelWrapper).toHaveClass('right-4');

        const fullscreenPanel = screen.getByTestId('fullscreen-panel');

        // Move mouse to right side (> 500)
        fireEvent.mouseMove(fullscreenPanel, { clientX: 800 });
        expect(panelWrapper).toHaveClass('left-4');
        expect(panelWrapper).not.toHaveClass('right-4');

        // Move mouse to left side (< 500)
        fireEvent.mouseMove(fullscreenPanel, { clientX: 200 });
        expect(panelWrapper).toHaveClass('right-4');
        expect(panelWrapper).not.toHaveClass('left-4');
    });
});

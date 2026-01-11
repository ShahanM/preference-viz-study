import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useCallback, useRef } from 'react';

export const useTour = () => {
    const driverObj = useRef<ReturnType<typeof driver>>(null);

    const startMainTour = useCallback((initialStep: number = 0) => {
        driverObj.current = driver({
            showProgress: true,
            animate: true,
            onHighlightStarted: (_element, step, options) => {
                if (step) {
                    sessionStorage.setItem('current_tour_index', String(options.state.activeIndex));
                }
            },
            onDestroyed: () => {
                // If we reached the end naturally, clear the index
                if (driverObj.current && !driverObj.current.hasNextStep()) {
                    sessionStorage.removeItem('current_tour_index');
                }
                // If destroyed prematurely (e.g. fullscreen toggle), the index remains in storage
            },
            steps: [
                {
                    element: '#condition-view-container',
                    popover: {
                        title: 'Explore Your Preferences',
                        description:
                            'This visualization helps you explore your preferences. Hover over any movie poster to see details. Click a poster to "lock" it (sticky mode) so you can read the details without holding your mouse still. Click again or click the background to unlock.',
                        side: 'left',
                        align: 'start',
                    },
                },
                {
                    element: '#info-panel-sidebar, #info-panel-overlay',
                    popover: {
                        title: 'Info Panel',
                        description:
                            'This panel displays detailed information about the selected or hovered movie, including cast, director, and plot.',
                        side: 'left',
                    },
                },
                {
                    element: '#viz-enlarge-btn',
                    popover: {
                        title: 'Maximize View',
                        description: 'Click this button to expand the visualization to full screen for a better view.',
                        side: 'left',
                    },
                },
                {
                    element: '#participant-response-panel',
                    popover: {
                        title: 'Your Task',
                        description:
                            'This is where you will provide your feedback. Please read the instructions carefully.',
                        side: 'right',
                    },
                },
                {
                    element: '#response-group-exploration',
                    popover: {
                        title: 'Exploration',
                        description: 'Use this section to note movies that might help you explore new interests.',
                        side: 'right',
                    },
                },
                {
                    element: '#response-group-familiarity',
                    popover: {
                        title: 'Familiarity',
                        description: 'Identify movies you are unfamiliar with here.',
                        side: 'right',
                    },
                },
                {
                    element: '#enlarge-btn-familiarity',
                    popover: {
                        title: 'Expand Text Area',
                        description: 'If you need more space to write, click this button to open a larger editor.',
                        side: 'bottom',
                    },
                },
                {
                    element: '#response-group-explanation',
                    popover: {
                        title: 'Explanation',
                        description:
                            'Explain the concrete steps you would take to expand your preferences based on your findings.',
                        side: 'right',
                    },
                },
                {
                    element: '#save-response-btn',
                    popover: {
                        title: 'Save Progress',
                        description:
                            "Don't forget to save your drafts! The button will be enabled when you have unsaved changes.",
                        side: 'left',
                    },
                },
                {
                    element: 'nav button',
                    popover: {
                        title: 'Proceed',
                        description:
                            'Once you are satisfied with your responses, click Next to proceed to the next step of the study.',
                        side: 'top',
                    },
                },
            ],
            onDestroyStarted: () => {
                if (!driverObj.current?.hasNextStep() || confirm('Are you sure you want to exit the tour?')) {
                    driverObj.current?.destroy();
                }
            },
        });
        driverObj.current.drive(initialStep);
    }, []);

    const startFullscreenTour = useCallback(() => {
        // Create a new driver instance for the mini-tour to avoid conflicts
        const fsDriver = driver({
            showProgress: false,
            animate: true,
            steps: [
                {
                    element: '#viz-exit-fullscreen-btn',
                    popover: {
                        title: 'Exit Full Screen',
                        description: 'Click here to return to the main view.',
                        side: 'top',
                    },
                },
            ],
        });
        fsDriver.drive();
    }, []);

    return { startMainTour, startFullscreenTour };
};

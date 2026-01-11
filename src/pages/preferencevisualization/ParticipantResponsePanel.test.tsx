// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import ParticipantResponsePanel from './ParticipantResponsePanel';

expect.extend(matchers);

// Mock dependencies
const mockStudyStep = { id: 'step-123' };
const mockStudyApi = {
    post: vi.fn(),
    patch: vi.fn(),
};
const mockSetIsStepComplete = vi.fn();

// Mock useOutletContext
vi.mock('react-router-dom', () => ({
    useOutletContext: () => ({ studyStep: mockStudyStep }),
}));

// Mock useStudy
vi.mock('rssa-api', () => ({
    useStudy: () => ({ studyApi: mockStudyApi }),
}));

// Mock useStepCompletion
vi.mock('rssa-study-template', () => ({
    useStepCompletion: () => ({ setIsStepComplete: mockSetIsStepComplete }),
}));

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: false },
    },
});

// renderComponent is defined inside the describe block now to use the local mocks
// const renderComponent = () => {
//     return render(
//         <QueryClientProvider client={queryClient}>
//             <ParticipantResponsePanel
//                 participantResponse={undefined}
//                 condition={{ id: 1, name: 'Test Condition' }}
//             />
//         </QueryClientProvider>
//     );
// };

describe('ParticipantResponsePanel Save Logic', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        queryClient.clear();
    });

    afterEach(() => {
        cleanup();
    });

    const renderComponent = () => {
        return render(
            <QueryClientProvider client={queryClient}>
                <ParticipantResponsePanel
                    participantResponse={undefined}
                    condition={{ id: 1, name: 'Test Condition' }}
                />
            </QueryClientProvider>
        );
    };

    it('Save button is disabled initially', () => {
        renderComponent();

        const saveButton = screen.getByText('Save Notes').closest('button');
        expect(saveButton).toBeDisabled();
    });

    it('Save button enables when one field is modified (Partial Draft)', async () => {
        renderComponent();

        const familiarityInput = screen.getByLabelText(/are you unfamiliar with/i);
        fireEvent.change(familiarityInput, { target: { value: 'Some text' } });

        const saveButton = screen.getByText('Save Notes').closest('button');
        expect(saveButton).toBeEnabled();
    });

    it('Save button disables when text is reverted to match saved state', async () => {
        renderComponent();

        const familiarityInput = screen.getByLabelText(/are you unfamiliar with/i);
        fireEvent.change(familiarityInput, { target: { value: 'Some text' } });

        const saveButton = screen.getByText('Save Notes').closest('button');
        expect(saveButton).toBeEnabled();

        // Revert change
        fireEvent.change(familiarityInput, { target: { value: '' } });
        expect(saveButton).toBeDisabled();
    });

    it('Save button disables after successful save', async () => {
        // Mock successful POST
        mockStudyApi.post.mockResolvedValueOnce({
            id: 'resp-1',
            version: 1,
            payload_json: {
                familiarity: 'Some text',
                exploration: '',
                explanation: '',
            },
        });

        renderComponent();

        const familiarityInput = screen.getByLabelText(/are you unfamiliar with/i);
        fireEvent.change(familiarityInput, { target: { value: 'Some text' } });

        const saveButton = screen.getByText('Save Notes').closest('button');
        fireEvent.click(saveButton!);

        // Wait for mutation to finish and update local state
        await waitFor(() => {
            expect(mockStudyApi.post).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(saveButton).toBeDisabled();
        });
    });
});

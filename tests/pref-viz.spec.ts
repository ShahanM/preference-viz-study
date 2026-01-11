import { test, expect } from '@playwright/test';
import { ConsentPage } from './pages/ConsentPage';
import { OverviewPage } from './pages/OverviewPage';
import { InstructionPage } from './pages/InstructionPage';
import { SurveyPage } from './pages/SurveyPage';
import { RatingPage } from './pages/RatingPage';
import { VisualizationPage } from './pages/VisualizationPage';
import { FeedbackPage } from './pages/FeedbackPage';
import { DemographicsPage } from './pages/DemographicsPage';

test.describe('Pref-Viz E2E Flow', () => {
    test('Complete Study Happy Path (Real)', async ({ page }) => {
        test.setTimeout(120000); // Allow more time for full flow
        page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));

        // Interspect Survey API response
        page.on('response', async (response) => {
            const url = response.url();
            if ((url.includes('/pages/') || url.includes('/steps/')) && response.status() === 200) {
                try {
                    const json = await response.json();
                    console.log(`TEST DEBUG: API Response for ${url}:`, JSON.stringify(json, null, 2));
                } catch (e) {
                    // ignore non-json
                }
            }
        });

        // 1. Landing
        await page.goto('/');
        const startButton = page.getByRole('button', { name: 'Start study' });
        await expect(startButton).toBeVisible();
        await expect(startButton).toBeEnabled();
        await startButton.click();

        // 2. Consent
        const consentPage = new ConsentPage(page);
        await consentPage.completeConsent();

        // 3. Overview
        const overviewPage = new OverviewPage(page);
        await overviewPage.waitAndContinue();

        // 4. Pre-Survey
        // Note: In the real flow, Pre-Survey comes BEFORE the Scenario Instruction.
        console.log('TEST: Starting Pre-Survey');
        const preSurveyPage = new SurveyPage(page);
        await preSurveyPage.completeRandomly();

        // 5. Instruction / Scenario
        const instructionPage = new InstructionPage(page);
        // We use a try-catch or conditional check if we are unsure,
        // but given the logs show ScenarioPage, we treat it as part of the flow.
        try {
            console.log('TEST: Checking for Instruction/Scenario step...');
            await expect(page.getByText('Your task', { exact: false })).toBeVisible({ timeout: 5000 });
            console.log('TEST: Scenario found, proceeding...');
            await instructionPage.waitAndContinue();
        } catch (e) {
            console.log('TEST: No Instruction step found or skipped.');
        }

        // 6. Rating (Preference Elicitation)
        const ratingPage = new RatingPage(page);
        await ratingPage.rateMovies(10);

        // 7. Visualization
        const vizPage = new VisualizationPage(page);
        await vizPage.interactAndSave();

        // 8. Feedback
        const feedbackPage = new FeedbackPage(page);
        await feedbackPage.provideFeedback();

        // 9. Post-Survey
        const postSurveyPage = new SurveyPage(page);
        await postSurveyPage.completeRandomly();

        // 10. Demographics
        const demographicsPage = new DemographicsPage(page);
        await demographicsPage.completeForm();

        // 11. Completion
        await expect(page.getByText('Thank you')).toBeVisible();
    });
});

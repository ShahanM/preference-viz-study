import { test as base, expect, type Route } from '@playwright/test';
export { expect } from '@playwright/test';

const STUDY_ID = 'afd0d6d8-51db-46c1-a04a-fc1db13d3e65';

type StudyFixtures = {
    mockApi: void;
};

export const test = base.extend<StudyFixtures>({
    mockApi: [
        async ({ page }, use) => {
            // Mock Study Config
            await page.route(/\/studies\/.*\/config/, async (route: Route) => {
                console.log('MOCK HIT: config');
                const json = {
                    study_id: STUDY_ID,
                    steps: [
                        { step_id: 'step-1', component_type: 'ConsentStep', path: '/consent' },
                        { step_id: 'step-2', component_type: 'StudyOverviewStep', path: '/overview' },
                        { step_id: 'step-3', component_type: 'SurveyStep', path: '/survey' },
                        {
                            step_id: 'step-4',
                            component_type: 'PreferenceElicitationStep',
                            path: '/preference-elicitation',
                        },
                        { step_id: 'step-5', component_type: 'TaskStep', path: '/preference-visualization' },
                        { step_id: 'step-6', component_type: 'ExtraStep', path: '/feedback' },
                        { step_id: 'step-7', component_type: 'SurveyStep', path: '/post-survey' },
                        { step_id: 'step-8', component_type: 'DemographicsStep', path: '/demographics' },
                        { step_id: 'step-9', component_type: 'CompletionStep', path: '/final' },
                    ],
                    conditions: {
                        default: 'cond1',
                    },
                };
                await route.fulfill({ json });
            });

            // Mock Participants
            await page.route(/\/participants/, async (route: Route) => {
                await route.fulfill({
                    json: {
                        id: 'p1',
                        study_id: STUDY_ID,
                        study_condition: {
                            id: 'cond1',
                            name: 'Condition 1',
                            description: 'Test Condition',
                            short_code: 'Continuous Coupled',
                            date_created: new Date().toISOString(),
                        },
                        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJwMSIsIm5hbWUiOiJKb2huIERvZSIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
                    },
                });
            });

            // Mock New Participant (Consent)
            await page.route(/\/studies\/.*\/new-participant/, async (route: Route) => {
                console.log('MOCK HIT: new participant');
                await route.fulfill({
                    status: 200,
                    json: {
                        token: 'eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9.eyJzdWIiOiAicDEiLCAic2lkIjogInMxIiwgImV4cCI6IDE3Njc5OTgxMTN9.signature',
                        resume_code: 'MOCK-RESUME-CODE',
                    },
                });
            });

            // Mock Step Details (generic for step-*)
            await page.route(/\/steps\/step-.*/, async (route: Route) => {
                const url = route.request().url();
                const stepIdMatch = url.match(/(step-\d+)/);
                const stepId = stepIdMatch ? stepIdMatch[1] : 'step-1';
                console.log('MOCK HIT: step details', stepId);

                const steps = [
                    { step_id: 'step-1', component_type: 'ConsentStep', path: '/consent' },
                    { step_id: 'step-2', component_type: 'StudyOverviewStep', path: '/overview' },
                    { step_id: 'step-3', component_type: 'SurveyStep', path: '/survey' },
                    { step_id: 'step-4', component_type: 'PreferenceElicitationStep', path: '/preference-elicitation' },
                    { step_id: 'step-5', component_type: 'TaskStep', path: '/preference-visualization' },
                    { step_id: 'step-6', component_type: 'ExtraStep', path: '/feedback' },
                    { step_id: 'step-7', component_type: 'SurveyStep', path: '/post-survey' },
                    { step_id: 'step-8', component_type: 'DemographicsStep', path: '/demographics' },
                    { step_id: 'step-9', component_type: 'CompletionStep', path: '/final' },
                ];

                const currentIndex = steps.findIndex((s) => s.step_id === stepId);
                const stepConfig = steps[currentIndex];
                const nextStep = steps[currentIndex + 1];

                const baseResponse = {
                    id: stepId,
                    content: `<h1>Step ${stepId}</h1><p>Content for ${stepId}</p>`,
                    type: stepConfig?.component_type || 'unknown',
                    html: `<h1>Step ${stepId}</h1><p>Content for ${stepId}</p>`,
                    next_step: nextStep ? nextStep.step_id : undefined,
                    next_path: nextStep ? nextStep.path : undefined,
                };

                // Inject Survey Data if needed
                if (stepConfig?.component_type === 'SurveyStep') {
                    Object.assign(baseResponse, {
                        root_page_info: {
                            data: {
                                id: `page-${stepId}`,
                                description: 'Mock Survey Page',
                                order_position: 0,
                                study_step_page_contents: [
                                    {
                                        id: `content-${stepId}`,
                                        study_step_page_id: `page-${stepId}`,
                                        preamble: 'Please answer.',
                                        survey_construct_id: 'c1',
                                        display_name: 'Construct 1',
                                        items: [
                                            {
                                                id: 'item-1',
                                                survey_construct_id: 'c1',
                                                display_name: 'Question 1',
                                                order_position: 0,
                                            },
                                        ],
                                        scale_levels: [
                                            {
                                                id: 'sl-1',
                                                survey_scale_id: 'sc1',
                                                display_name: 'Yes',
                                                value: 1,
                                                order_position: 0,
                                            },
                                            {
                                                id: 'sl-2',
                                                survey_scale_id: 'sc1',
                                                display_name: 'No',
                                                value: 0,
                                                order_position: 1,
                                            },
                                        ],
                                    },
                                ],
                                next: null,
                            },
                            next_id: null,
                            next_path: null,
                        },
                    });
                }

                await route.fulfill({ status: 200, json: baseResponse });
            });

            // Mock Start Study (Specific)
            await page.route(/\/studies\/.*\/steps\/first/, async (route: Route) => {
                console.log('MOCK HIT: start study');
                await route.fulfill({
                    status: 200,
                    json: {
                        step_id: 'step-1',
                        component_type: 'ConsentStep',
                        path: '/consent',
                        content: '<h1>Informed Consent</h1>',
                        html: '<h1>Informed Consent</h1>',
                    },
                });
            });

            // Mock generic steps/navigation
            await page.route(/\/studies\/.*\/steps\/.*\/page\/.*\/view/, async (route: Route) => {
                await route.fulfill({ status: 200 });
            });

            // Mock interaction/events
            await page.route(/\/interactions/, async (route: Route) => {
                await route.fulfill({ status: 200 });
            });

            // Mock Responses (Survey, etc.)
            await page.route('**/responses/**', async (route: Route) => {
                const method = route.request().method();
                const url = route.request().url();
                console.log(`MOCK HIT: responses [${method}] ${url}`);

                if (method === 'GET') {
                    // Return empty array for initial load
                    await route.fulfill({ status: 200, json: [] });
                } else if (method === 'POST') {
                    // Return created response
                    await route.fulfill({
                        status: 200,
                        json: {
                            id: 'response-new-1',
                            version: 1,
                            survey_scale_level_id: 'sl-1', // Matches logic
                            ...route.request().postDataJSON(),
                        },
                    });
                } else if (method === 'PATCH') {
                    // Return updated response
                    await route.fulfill({
                        status: 200,
                        json: {
                            ...route.request().postDataJSON(),
                            version: 2,
                        },
                    });
                } else {
                    await route.fulfill({ status: 200, json: { status: 'success' } });
                }
            });

            // 5. Mock Movies (with proper pagination structure)
            await page.route('**/movies*', async (route: Route) => {
                console.log('MOCK HIT: movies', route.request().url());
                const movies = Array.from({ length: 20 }, (_, i) => ({
                    id: `movie-${i}`,
                    title: `Movie ${i}`,
                    year: 2020 + i,
                    poster: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
                    tmdb_poster:
                        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
                    description: 'Description',
                    genre: 'Action',
                    director: 'Director',
                    cast: 'Cast',
                }));
                await route.fulfill({
                    status: 200,
                    json: {
                        items: movies,
                        total: 20,
                        limit: 20,
                        offset: 0,
                    },
                });
            });

            // Mock Ratings
            await page.route('**/responses/ratings/**', async (route: Route) => {
                const method = route.request().method();
                console.log(`MOCK HIT: ratings [${method}] ${route.request().url()}`);
                if (method === 'GET') {
                    await route.fulfill({ status: 200, json: [] });
                } else {
                    // POST
                    await route.fulfill({ status: 200, json: { status: 'success' } });
                }
            });

            await use();
        },
        { auto: true },
    ],
});

import { expect, Locator, Page } from '@playwright/test';

export class SurveyPage {
    readonly page: Page;
    readonly nextButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.nextButton = page.getByRole('button', { name: /Next/i });
    }

    async completeRandomly() {
        // Wait for page to load
        await this.page.waitForURL(/.*survey*/);

        // DEBUG: Log all inputs
        // const inputs = await this.page.evaluate(() => {
        //     return Array.from(document.querySelectorAll('input, select, textarea')).map(el => ({
        //         tag: el.tagName,
        //         type: (el as HTMLInputElement).type,
        //         name: (el as HTMLInputElement).name,
        //         visible: (el as HTMLElement).offsetParent !== null
        //     }));
        // });
        // console.log('TEST: Form Inputs:', JSON.stringify(inputs));

        // Wait for at least one text or radio to be visible
        await this.page.locator('div[role="radiogroup"]').first().waitFor({ state: 'visible', timeout: 10000 });

        // Find all radio groups - this is heuristic
        const radioGroups = await this.page.locator('div[role="radiogroup"]').all();
        console.log(`TEST: Found ${radioGroups.length} radio groups`);

        if (radioGroups.length === 0) {
            console.warn('TEST WARNING: No radio groups found!');
            // throw new Error('TEST ERROR: No radio groups found!'); // Allow continuing if no radios
        } else {
            console.log(`TEST: Processing ${radioGroups.length} radio groups`);
        }

        for (let index = 0; index < radioGroups.length; index++) {
            const group = radioGroups[index];
            // console.log('TEST: Group inner HTML:', await group.innerHTML());
            const option = group.getByRole('radio').first();
            await option.click({ force: true });
            console.log(`TEST: Clicking option for group ${index}`);
            await option.click();
            await expect(option).toBeChecked(); // Wait for state update
            console.log(`TEST: Clicked and verified option for group ${index}`);
            // Wait for debounce/mutation trigger
            await this.page.waitForTimeout(500);
        }

        // const textInputs = await this.page.getByRole('textbox').all();
        // console.log(`TEST: Found ${textInputs.length} text inputs/textareas`);
        // for (const input of textInputs) {
        // await input.fill('Test Answer');
        // await input.blur(); // Trigger validation
        // }

        console.log('TEST: Waiting for mutations to complete...');
        // Wait longer for real backend calls
        await this.page.waitForTimeout(5000);
        console.log('NEXT BUTTON:', this.nextButton);
        await expect(this.nextButton).toBeEnabled({ timeout: 10000 });
        await this.nextButton.click();
    }
}

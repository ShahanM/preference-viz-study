import { expect, Locator, Page } from '@playwright/test';

export class DemographicsPage {
    readonly page: Page;
    readonly submitButton: Locator;
    readonly nextButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.submitButton = page.getByRole('button', { name: /Submit/i });
        this.nextButton = page.getByRole('button', { name: /Next/i });
    }

    async completeForm() {
        // Find selects
        const selects = await this.page.locator('select').all();
        for (const select of selects) {
            // Select second option (index 1) assuming index 0 is placeholder
            await select.selectOption({ index: 1 });
        }

        await this.submitButton.click();
        await expect(this.nextButton).toBeEnabled();
        await this.nextButton.click();
    }
}

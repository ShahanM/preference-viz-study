import { expect, Locator, Page } from '@playwright/test';

export class InstructionPage {
    readonly page: Page;
    readonly nextButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.nextButton = page.getByRole('button', { name: /Next/i });
    }

    async waitAndContinue() {
        // Wait for content to load
        await this.page.waitForLoadState('domcontentloaded');
        await expect(this.nextButton).toBeVisible();

        // Wait for button to be enabled (handling potential reading timer)
        await expect(this.nextButton).toBeEnabled({ timeout: 30000 });
        await this.nextButton.click();
    }
}

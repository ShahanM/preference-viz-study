import { expect, Locator, Page } from '@playwright/test';

export class OverviewPage {
    readonly page: Page;
    readonly nextButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.nextButton = page.getByRole('button', { name: /Next/i });
    }

    async waitAndContinue() {
        console.log('TEST: OverviewPage.waitAndContinue - start');
        await expect(this.nextButton).toBeDisabled();
        // Wait for the timer (3s in real app, might be mocked or fast-forwarded if possible, but 3.5s wait is safe)
        await this.page.waitForTimeout(3500);
        await expect(this.nextButton).toBeEnabled();
        console.log('TEST: OverviewPage.waitAndContinue - enabled');
        await this.nextButton.click();
        console.log('TEST: OverviewPage.waitAndContinue - clicked');
    }
}

import { expect, Locator, Page } from '@playwright/test';

export class FeedbackPage {
    readonly page: Page;
    readonly submitButton: Locator;
    readonly nextButton: Locator;
    readonly textarea: Locator;

    constructor(page: Page) {
        this.page = page;
        this.submitButton = page.getByRole('button', { name: /Submit/i });
        this.nextButton = page.getByRole('button', { name: /Next/i });
        this.textarea = page.locator('textarea');
    }

    async provideFeedback() {
        await this.textarea.fill('Great study!');
        await this.submitButton.click();
        await expect(this.nextButton).toBeEnabled();
        await this.nextButton.click();
    }
}

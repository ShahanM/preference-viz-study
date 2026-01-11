import { expect, Locator, Page } from '@playwright/test';

export class ConsentPage {
    readonly page: Page;
    readonly checkbox: Locator;
    readonly consentButton: Locator;
    readonly nextButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.checkbox = page.getByText(/I have read and understood/i);
        this.consentButton = page.getByRole('button', { name: /I consent/i });
        this.nextButton = page.getByRole('button', { name: /Next/i });
    }

    async completeConsent() {
        await this.checkbox.click();
        await this.consentButton.click();
        await expect(this.nextButton).toBeEnabled();
        await this.nextButton.click();
    }
}

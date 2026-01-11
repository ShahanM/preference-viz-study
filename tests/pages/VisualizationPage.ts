import { expect, Locator, Page } from '@playwright/test';

export class VisualizationPage {
    readonly page: Page;
    readonly saveButton: Locator;
    readonly nextButton: Locator;
    readonly textAreas: Locator;

    constructor(page: Page) {
        this.page = page;
        this.saveButton = page.getByRole('button', { name: /Save/i });
        this.nextButton = page.getByRole('button', { name: /Next/i });
        this.textAreas = page.locator('textarea');
    }

    async interactAndSave() {
        // 3 text prompts
        await this.textAreas.first().waitFor({ timeout: 10000 });
        const count = await this.textAreas.count();
        if (count === 0) throw new Error('No text areas found in Visualization Step');

        for (let i = 0; i < count; i++) {
            await this.textAreas.nth(i).fill(`Test response for prompt ${i}`);
        }

        await expect(this.saveButton).toBeEnabled();
        await this.saveButton.click();

        // Wait for save to complete (button might disable or show saved state)
        // Assuming Next becomes enabled
        await expect(this.nextButton).toBeEnabled();
        await this.nextButton.click();
    }
}

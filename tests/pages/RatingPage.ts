import { expect, Locator, Page } from '@playwright/test';

export class RatingPage {
    readonly page: Page;
    readonly nextButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.nextButton = page.getByRole('button', { name: /Next/i });
    }

    async rateMovies(count: number = 10) {
        // Wait for movies to load (by checking for at least one poster image)
        await this.page.waitForSelector('img[alt^="Poster for"]', { timeout: 30000 });

        // Find all movie cards via their poster images
        const posters = await this.page.locator('img[alt^="Poster for"]').all();
        console.log(`TEST: Found ${posters.length} movie posters.`);

        if (posters.length < count) {
            console.warn(
                `TEST WARNING: Requested to rate ${count} movies but only found ${posters.length}. Rating all available.`
            );
        }

        const limit = Math.min(count, posters.length);

        for (let i = 0; i < limit; i++) {
            // The card root is the container of the image.
            // Structure: Card Root > Div > Img. Star Rating is sibling of Div > Img.
            // We can just find the StarRating inside the card (or nearby).
            // Actually, we can click the 3rd star SVG that follows this poster.
            // Playwright 'near' or 'below' is useful, or relative locators.

            // Simpler: Find the specific star relative to the poster's container.
            // parent of img is div.relative. parent of that is Card Root.
            // Card Root has a second child div containing StarRating.

            const poster = posters[i];
            const cardRoot = poster.locator('xpath=../..'); // Up 2 levels

            // Find the 3rd star (div wrapping svg)
            // The star rating divs are direct children of a flex container.
            // We will click the 3rd child div of the rating container.
            const ratingContainer = cardRoot.locator('div.flex.justify-center');
            const thirdStar = ratingContainer.locator('> div').nth(2); // 3rd star

            await thirdStar.click();
            // console.log(`TEST: Rated movie ${i+1}`);

            // Small delay to ensure state update/network
            if (i % 5 === 0) await this.page.waitForTimeout(100);
        }

        // Wait for next button to be enabled
        await expect(this.nextButton).toBeEnabled({ timeout: 10000 });
        await this.nextButton.click();
    }
}

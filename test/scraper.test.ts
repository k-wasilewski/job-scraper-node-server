import { SPRING_SCRAPE_UUID } from "../src/auth";
import { scrape } from "../src/scraper";

describe('scraper spec', () => {
    it('scrape doesnt execute for SPRING_SCRAPE_UUID', async () => {
        const res = await scrape(
            'host',
            'path',
            'jobAnchorSelector',
            'jobLinkContains',
            1,
            SPRING_SCRAPE_UUID
        );
        expect(res).toBeUndefined();
    });
});
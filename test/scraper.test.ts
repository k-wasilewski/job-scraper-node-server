import { SPRING_SCRAPE_UUID } from "../src/auth";
import { scrape } from "../src/scraper";

jest.mock('apollo-server-express', () => ({
    ApolloServer: jest.fn()
}));

jest.mock('bcrypt', () => ({
    __esModule: true,
    default: jest.fn()
}));

jest.mock('fs', () => ({
    __esModule: true,
    default: {
        mkdirSync: jest.fn()
    }
}));

jest.mock('puppeteer', () => ({
    __esModule: true,
    default: {
        launch: () => ({
            newPage: () => ({
                goto: jest.fn(),
                waitForSelector: jest.fn(),
                evaluate: jest.fn().mockReturnValue(['link1', 'link2']),
                setViewport: jest.fn(),
                screenshot: jest.fn()
            })
        })
    },
}));

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

    it('scrape persists jobs to mongodb, saves screenshots, publishes events', async () => {
        const res = await scrape(
            'host',
            'path',
            'jobAnchorSelector',
            'jobLinkContains',
            1,
            'userUuid'
        );

        // todo

        expect(res).toEqual({ complete: true });
    });
});
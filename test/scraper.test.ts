import { SPRING_SCRAPE_UUID } from "../src/auth";
import { scrape } from "../src/scraper";
import fs from 'fs';
import puppeteer from "puppeteer";
import * as mongodb from '../src/mongodb';
import { pubsub } from "../src/resolvers";

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

let i = 1;
const mockScreenshot = jest.fn();
const mockSetViewport = jest.fn();
const mockEvaluate = jest.fn().mockImplementation(() => {
    return i++ % 2 === 0 ? [] : ['/link1', '/jobLinkContains1', '/jobLinkContains2'];
});
const mockWaitForSelector = jest.fn();
const mockGoto = jest.fn();
const mockNewPage = jest.fn().mockImplementation(() => ({
    goto: mockGoto,
    waitForSelector: mockWaitForSelector,
    evaluate: mockEvaluate,
    setViewport: mockSetViewport,
    screenshot: mockScreenshot
}));
jest.mock('puppeteer', () => ({
    __esModule: true,
    default: {
        launch: jest.fn().mockImplementation(() => ({
            newPage: mockNewPage
        }))
    },
}));

let k = 0;
jest.mock('../src/mongodb', () => ({
    getJobByLink: jest.fn().mockImplementation(() => {
        return k++ % 2 === 0 ? null : {
            uuid: 'mockUuid',
            host: 'mockHost',
            path: 'mockPath',
            link: 'mockLink',
            userUuid: 'mockUserUuid'
        }; 
    }),
    insertToJobs: jest.fn()   
}));

jest.mock('../src/resolvers', () => ({
    pubsub: {
        publish: jest.fn()
    }
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
            'http://host.com',
            '/path/to/my/resource/{}',
            'jobAnchorSelector',
            'jobLinkContains',
            2,
            'userUuid'
        );

        expect(puppeteer.launch).toHaveBeenCalled();
        expect(mockWaitForSelector).toHaveBeenCalledTimes(2);
        expect(mockWaitForSelector).toHaveBeenCalledWith('jobAnchorSelector');
        expect(mockEvaluate).toHaveBeenCalledTimes(2);
        expect(fs.mkdirSync).toHaveBeenCalledWith('./screenshots/userUuid/host', { recursive: true });
        expect(mockNewPage).toHaveBeenCalledTimes(3);
        expect(mockSetViewport).toHaveBeenCalledTimes(2);
        expect(mockGoto).toHaveBeenCalledTimes(4);
        expect(mockGoto).toHaveBeenCalledWith('http://host.com/path/to/my/resource/1');
        expect(mockGoto).toHaveBeenCalledWith('http://host.com/path/to/my/resource/2');
        expect(mockGoto).toHaveBeenCalledWith('http://host.com/jobLinkContains1');
        expect(mockGoto).toHaveBeenCalledWith('http://host.com/jobLinkContains2');
        expect(mongodb.getJobByLink).toHaveBeenCalledTimes(2);
        expect(mongodb.getJobByLink).toHaveBeenCalledWith('userUuid', 'http://host.com/jobLinkContains1');
        expect(mongodb.getJobByLink).toHaveBeenCalledWith('userUuid', 'http://host.com/jobLinkContains2'); 
        expect(mongodb.insertToJobs).toHaveBeenCalledTimes(1);
        expect(mongodb.insertToJobs).toHaveBeenCalledWith({ host: 'http://host.com', path: '/path/to/my/resource/{}', link: 'http://host.com/jobLinkContains1', userUuid: 'userUuid', uuid: expect.stringContaining('-') });
        expect(mockScreenshot).toHaveBeenCalledTimes(1);
        expect(mockScreenshot).toHaveBeenCalledWith({path: expect.stringMatching(/.\/screenshots\/userUuid\/host\/\w{8}-\w{4}-4\w{3}-\w{4}-\w{12}.png/), fullPage: true});
        expect(pubsub.publish).toHaveBeenCalledTimes(1);
        expect(pubsub.publish).toHaveBeenCalledWith('newJobs', { newJobs: { timestamp: new Date().toString(), link: 'http://host.com/jobLinkContains1' } });
        expect(res).toEqual({ complete: true });
    });
});
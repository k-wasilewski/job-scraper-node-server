import puppeteer from 'puppeteer';
import fs from 'fs';
//import {getJobByLink, insertToJobs, Job} from "./mongodb";
import {generateUUID, getPath, getWebpageName} from "./utils";

export const scrape = async (
    host: string,
    path: string,
    jobAnchorSelector: string,
    jobLinkContains: string,
    numberOfPages: number
) => {
    const browser = await puppeteer.launch({});
    const page = await browser.newPage();

    for (let i=1; i<=numberOfPages; i++) {
        try {
            await page.goto(host + getPath(path, i));
        } catch {
            break;
        }

        await page.waitForSelector(jobAnchorSelector)
        const arr = await page.evaluate(
            (jobAnchorSelector) => {
                return Array.from(
                    document.querySelectorAll(jobAnchorSelector),
                    a => a.getAttribute('href')
                )
            }, jobAnchorSelector
        );

        const name = getWebpageName(host);
        fs.mkdirSync('./screenshots/' + name, { recursive: true });

        for (const job of arr) {
            if (!job.includes(jobLinkContains)) continue;

            const jobPage = await browser.newPage();
            const jobLink = job.includes('http') ? job : host + job;

            /*const mongodbRecord: Job = { host, path, link: jobLink };
            const persistedJob = getJobByLink(mongodbRecord.link);
            let uuid: string;
            if (persistedJob) {
                uuid = persistedJob.uuid;
            } else {
                uuid = generateUUID();
                mongodbRecord.uuid = uuid;
                insertToJobs(mongodbRecord);
            }*/const uuid = generateUUID()

            await jobPage.goto(jobLink);
            await jobPage.screenshot({path: './screenshots/' + name + '/' + uuid + '.png', fullPage: true});
            await jobPage.screenshot({path: './screenshots/' + name + '/_' + uuid + '.png'});
        }
    }

    return { complete: true };
}
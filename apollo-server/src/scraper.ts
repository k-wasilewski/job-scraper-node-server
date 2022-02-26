import puppeteer from 'puppeteer';
import fs from 'fs';

//TODO: make sub-function generic and get in args: baseUri, jobAnchorSelector, {}-page-placeholder, numberOfPages
export const scrape = async (host: string, path: string, jobAnchorSelector: string, jobLinkContains: string, numberOfPages: number) => {
    let links: string[] = [];

    const browser = await puppeteer.launch({});
    const page = await browser.newPage();

    let j = 1;
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
            console.log(job)
            const jobPage = await browser.newPage();
            const jobLink = job.includes('http') ? job : host + job;
            await jobPage.goto(jobLink);
            await jobPage.screenshot({path: './screenshots/' + name + '/' + j++ + '.png', fullPage: true});
            links.push(jobLink);
        }
    }
}

const getPath = (path: string, n: number) => path.replace('{}', n.toString());

const getWebpageName = (host: string) => {
    const domainRe = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/;
    const tldRe = /(?<=\.)[^.]*$/;

    return domainRe.exec(host)[1].replace(tldRe, '').slice(0, -1);
}
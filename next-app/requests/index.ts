import axios from "axios";

const APOLLO_SERVER_ENDPOINT = "http://localhost:8080/graphql";
const SPRING_SERVER_ENDPOINT = "http://localhost:8081/graphql";

const getScrapeData = (host: string, path: string, jobAnchorSelector: string, jobLinkContains: string, numberOfPages: number) => {
    const _host = host.replace(/"/g, '&quot');
    const _path = path.replace(/"/g, '&quot');
    const _jobAnchorSelector = jobAnchorSelector.replace(/"/g, '&quot');
    const _jobLinkContains = jobLinkContains.replace(/"/g, '&quot');
    return { "query": `mutation { scrape(host: \"${_host}\", path: \"${_path}\", jobAnchorSelector: \"${_jobAnchorSelector}\", jobLinkContains: \"${_jobLinkContains}\", numberOfPages: ${numberOfPages}) { complete } }`};
}

const getAddScrapeConfigData = (host: string, path: string, jobAnchorSelector: string, jobLinkContains: string, numberOfPages: number, interval: number) => {
    const _host = host.replace(/"/g, '&quot');
    const _path = path.replace(/"/g, '&quot');
    const _jobAnchorSelector = jobAnchorSelector.replace(/"/g, '&quot');
    const _jobLinkContains = jobLinkContains.replace(/"/g, '&quot');
    return { "query": `mutation { addPage(host: \"${_host}\", path: \"${_path}\", jobAnchorSelector: \"${_jobAnchorSelector}\", jobLinkContains: \"${_jobLinkContains}\", numberOfPages: ${numberOfPages}, interval: ${interval}) { id, host, path, jobAnchorSelector, jobLinkContains, numberOfPages, interval } }`};
}

const getModifyScrapeConfigData = (id: number, host: string, path: string, jobAnchorSelector: string, jobLinkContains: string, numberOfPages: number, interval: number) => {
    const _host = host.replace(/"/g, '&quot');
    const _path = path.replace(/"/g, '&quot');
    const _jobAnchorSelector = jobAnchorSelector.replace(/"/g, '&quot');
    const _jobLinkContains = jobLinkContains.replace(/"/g, '&quot');
    return { "query": `mutation { modifyPage(id: ${id}, host: \"${_host}\", path: \"${_path}\", jobAnchorSelector: \"${_jobAnchorSelector}\", jobLinkContains: \"${_jobLinkContains}\", numberOfPages: ${numberOfPages}, interval: ${interval}) { id, host, path, jobAnchorSelector, jobLinkContains, numberOfPages, interval } }`};
}

const getScrapeConfigsData = () => {
    return { "query": "{ getPages { id, host, path, jobAnchorSelector, jobLinkContains, numberOfPages, interval } }"};
}

const getGroupNamesData = () => {
    return { "query": "{ getGroupNames { names } }"};
}

const getScreenshotsData = (groupName: string) => {
    return { "query": `{ getScreenshotsByGroup(groupName: \"${groupName}\") { files } }`};
}

const removeScrapeConfigData = (id: number) => {
    return { "query": `mutation { deletePage(id: ${id}) { id, host, path, jobAnchorSelector, jobLinkContains, numberOfPages, interval } }`};
}

const getRemoveScreenshotData = (group: string, uuid: string) => {
    return { "query": `mutation { removeScreenshotByGroupAndUuid(groupName: \"${group}\", uuid: \"${uuid}\") { deleted } }`};
}

export const scrape = (host: string, path: string, jobAnchorSelector: string, jobLinkContains: string, numberOfPages: number) => {
    return axios.post(APOLLO_SERVER_ENDPOINT, getScrapeData(host, path, jobAnchorSelector, jobLinkContains, numberOfPages));
}

export const persistScrapeConfig = (host: string, path: string, jobAnchorSelector: string, jobLinkContains: string, numberOfPages: number, interval: number) => {
    return axios.post(SPRING_SERVER_ENDPOINT, getAddScrapeConfigData(host, path, jobAnchorSelector, jobLinkContains, numberOfPages, interval));
}

export const modifyScrapeConfig = (id: number, host: string, path: string, jobAnchorSelector: string, jobLinkContains: string, numberOfPages: number, interval: number) => {
    return axios.post(SPRING_SERVER_ENDPOINT, getModifyScrapeConfigData(id, host, path, jobAnchorSelector, jobLinkContains, numberOfPages, interval));
}

export const removeScrapeConfig = (id: number) => {
    return axios.post(SPRING_SERVER_ENDPOINT, removeScrapeConfigData(id));
}

export const getScrapeConfigs = () => {
    return axios.post(SPRING_SERVER_ENDPOINT, getScrapeConfigsData());
}

export const getGroupNames = () => {
    return axios.post(APOLLO_SERVER_ENDPOINT, getGroupNamesData());
}

export const getScreenshotsByGroup = (group: string) => {
    return axios.post(APOLLO_SERVER_ENDPOINT, getScreenshotsData(group));
}

export const removeScreenshotByGroupAndUuid = (group: string, uuid: string) => {
    return axios.post(APOLLO_SERVER_ENDPOINT, getRemoveScreenshotData(group, uuid));
}
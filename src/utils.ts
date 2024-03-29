import fs from "fs";
import { Job } from "./mongodb";

export const generateUUID = () => {
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
}

export const getPath = (path: string, n: number) => path.replace('{}', n.toString());

export const getWebpageName = (host: string) => {
    const domainRe = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/;
    const tldRe = /(?<=\.)[^.]*$/;

    return domainRe.exec(host)[1].replace(tldRe, '').slice(0, -1);
}

export const getDirectories = (path: string) =>
    fs.readdirSync(path).filter((subdir: string) =>
        fs.statSync(path+'/'+subdir).isDirectory());

export const getFilenames = (path: string) =>
    fs.readdirSync(path).map((file: string) => /(.*)\.[a-z]*/.exec(file)[1]);

export const removeFile = (path: string) => {
    return fs.unlink(path, (error) => {
        if (error) {
            return false;
        }
        return true;
    });
    return false;
}

export const removeDir = (path: string) => {
    return fs.rmdir(path, (err) => {
        if (err) {
            return false;
        }
        return true;
    });
}

export const sameMembers = (arr1: Array<Object>, arr2: Array<Object>) => {
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);
    return arr1.every(item => set2.has(item)) &&
        arr2.every(item => set1.has(item))
}

export const getJobLinkByUuid = (uuid: string, jobs: Job[]) => {
    const job: Job = jobs.find(job => job.uuid === uuid);
    return job ? job.link : null;
}
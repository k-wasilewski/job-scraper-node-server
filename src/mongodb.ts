import {AnyError} from "mongodb";
// @ts-ignore
import {DeleteResult, InsertOneResult, MongoClient, UpdateResult} from "mongodb/mongodb";
import { pubsub } from "./resolvers";
import {getWebpageName} from "./utils";

const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const URL = 'mongodb://sa:password@localhost:27017';
const DB = 'scraping_db';
const JOBS_COLLECTION = 'jobs';
const USERS_COLLECTION = 'users';

export interface Job {
    uuid?: string;
    host: string;
    path: string;
    link: string;
    userUuid: string;
}

export interface User {
    uuid?: string;
    email: string;
    password: string;
}

export const insertToJobs = async (job: Job) => {
    if (!job.uuid) throw 'Job does not have an UUID assigned!';
    const db = await MongoClient.connect(URL);
    const dbo = db.db(DB);
    await dbo.collection(JOBS_COLLECTION).insertOne(job, (err?: AnyError, res?: InsertOneResult) => {
        if (err) throw err;
        db.close();
        pubsub.publish('newJobs', { newJobs: { timestamp: new Date().toString(), link: job.link } });
        return `${JSON.stringify(job)} has been inserted`;
    });
};

export const getJobByLink = async (userUuid: string, link: string) => {
    const db = await MongoClient.connect(URL);
    const dbo = db.db(DB);
    const foundJobs = await dbo.collection(JOBS_COLLECTION).find({ link, userUuid }).toArray();
    return foundJobs[0] || null;
};

export const deleteJobByUuid = async (userUuid: string, uuid: string) => {
    const db = await MongoClient.connect(URL);
    const dbo = db.db(DB);
    await dbo.collection(JOBS_COLLECTION).deleteOne({ uuid, userUuid }, (err?: AnyError, res?: DeleteResult) => {
        if (err) throw err;
        db.close();
        return `{ uuid: ${JSON.stringify(uuid)}} has been removed`;
    });
};

export const updateJobByUuid = async (job: Job) => {
    if (!job.uuid) throw 'Job does not have an UUID assigned!';
    const db = await MongoClient.connect(URL);
    const dbo = db.db(DB);
    await dbo.collection(JOBS_COLLECTION).updateOne({ uuid: job.uuid, userUuid: job.userUuid }, { $set: job }, (err?: AnyError, res?: UpdateResult) => {
        if (err) throw err;
        db.close();
        return `${JSON.stringify(job)} has been updated`;
    });
};

export const findJobsByGroupName = async (userUuid: string, groupName: string) => {
    const db = await MongoClient.connect(URL);
    const dbo = db.db(DB);
    const foundJobs = await dbo.collection(JOBS_COLLECTION).find({ userUuid, host: { $regex: groupName } }).toArray();
    return foundJobs || null;
}

export const findGroupNames = async (userUuid: string) => {
    const groupNames = new Array<string>();
    const db = await MongoClient.connect(URL);
    const dbo = db.db(DB);
    const foundJobs: Job[] = await dbo.collection(JOBS_COLLECTION).find({ userUuid }).toArray();
    foundJobs.forEach(job => {
        const groupName = getWebpageName(job.host);
        !groupNames.includes(groupName) && groupNames.push(groupName);
    });
    return groupNames;
}

export const findUserByEmail = async (email: string) => {
    const db = await MongoClient.connect(URL);
    const dbo = db.db(DB);
    const foundUser = await dbo.collection(USERS_COLLECTION).findOne({ email });
    return foundUser;
};

export const insertToUsers = async (user: User) => {
    if (!user.uuid) throw 'User does not have an UUID assigned!';
    const db = await MongoClient.connect(URL);
    const dbo = db.db(DB);
    await dbo.collection(USERS_COLLECTION).insertOne(user, (err?: AnyError, res?: InsertOneResult) => {
        if (err) throw err;
        db.close();
        return `${JSON.stringify(user)} has been inserted`;
    });
};
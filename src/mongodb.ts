import {AnyError} from "mongodb";
// @ts-ignore
import {DeleteResult, InsertOneResult, MongoClient, UpdateResult} from "mongodb/mongodb";
import { pubsub } from "./resolvers";

const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const URL = 'mongodb://sa:password@mongodb:27017';
const DB = 'scraping_db';
const JOBS_COLLECTION = 'jobs';
const USERS_COLLECTION = 'users';

export interface Job {
    uuid?: string;
    host: string;
    path: string;
    link: string;
}

export interface User {
    uuid?: string;
    email: string;
    password: string;
}

export const insertToJobs = (job: Job) => {
    if (!job.uuid) throw 'Job does not have an UUID assigned!';
    return MongoClient.connect(URL, (err?: AnyError, db?: MongoClient) => {
        if (err) throw err;
        const dbo = db.db(DB);
        dbo.collection(JOBS_COLLECTION).insertOne(job, (err?: AnyError, res?: InsertOneResult) => {
           if (err) throw err;
           db.close();
           pubsub.publish('newJobs', { newJobs: { timestamp: new Date().toString(), link: job.link } });
           return `${JSON.stringify(job)} has been inserted`;
        });
    });
};

export const getJobByLink = (link: string) => {
    return MongoClient.connect(URL, async (err?: AnyError, db?: MongoClient) => {
        if (err) throw err;
        const dbo = db.db(DB);
        const foundJobs = await dbo.collection(JOBS_COLLECTION).find({ link }).toArray();
        return foundJobs[0] || null;
    });
};

export const deleteJobByUuid = (uuid: string) => {
    return MongoClient.connect(URL, (err?: AnyError, db?: MongoClient) => {
        if (err) throw err;
        const dbo = db.db(DB);
        dbo.collection(JOBS_COLLECTION).deleteOne({ uuid }, (err?: AnyError, res?: DeleteResult) => {
            if (err) throw err;
            db.close();
            return `{ uuid: ${JSON.stringify(uuid)}} has been removed`;
        });
    });
};

export const updateJobByUuid = (job: Job) => {
    if (!job.uuid) throw 'Job does not have an UUID assigned!';
    return MongoClient.connect(URL, (err?: AnyError, db?: MongoClient) => {
        if (err) throw err;
        const dbo = db.db(DB);
        dbo.collection(JOBS_COLLECTION).updateOne({ uuid: job.uuid }, { $set: job }, (err?: AnyError, res?: UpdateResult) => {
            if (err) throw err;
            db.close();
            return `${JSON.stringify(job)} has been updated`;
        });
    });
};

export const findUserByEmail = (email: string) => {
    return MongoClient.connect(URL, async (err?: AnyError, db?: MongoClient) => {
        if (err) throw err;
        const dbo = db.db(DB);
        const foundUser = await dbo.collection(USERS_COLLECTION).findOne({ email });
        return foundUser;
    });
};

export const insertToUsers = (user: User) => {
    if (!user.uuid) throw 'User does not have an UUID assigned!';
    return MongoClient.connect(URL, (err?: AnyError, db?: MongoClient) => {
        if (err) throw err;
        const dbo = db.db(DB);
        dbo.collection(USERS_COLLECTION).insertOne(user, (err?: AnyError, res?: InsertOneResult) => {
            if (err) throw err;
            db.close();
            return `${JSON.stringify(user)} has been inserted`;
        });
    });
    return `${JSON.stringify(user)} has been inserted`;
};
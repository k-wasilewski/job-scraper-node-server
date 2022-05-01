import {AnyError} from "mongodb";
// @ts-ignore
import {DeleteResult, InsertOneResult, MongoClient, UpdateResult} from "mongodb/mongodb";
import { pubsub } from "./resolvers";

const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const URL = 'mongodb://sa:password@mongodb:27017';
const DB = 'scraping_db';
const COLLECTION = 'jobs';

export interface Job {
    uuid?: string;
    host: string;
    path: string;
    link: string;
}

export const insertToJobs = (job: Job) => {
    if (!job.uuid) throw 'Job does not have an UUID assigned!';
    return MongoClient.connect(URL, (err?: AnyError, db?: MongoClient) => {
        if (err) throw err;
        const dbo = db.db(DB);
        dbo.collection(COLLECTION).insertOne(job, (err?: AnyError, res?: InsertOneResult) => {
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
        const foundJobs = await dbo.collection(COLLECTION).find({ link }).toArray();
        return foundJobs[0] || null;
    });
};

export const deleteJobByUuid = (uuid: string) => {
    return MongoClient.connect(URL, (err?: AnyError, db?: MongoClient) => {
        if (err) throw err;
        const dbo = db.db(DB);
        dbo.collection(COLLECTION).deleteOne({ uuid }, (err?: AnyError, res?: DeleteResult) => {
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
        dbo.collection(COLLECTION).updateOne({ uuid: job.uuid }, { $set: job }, (err?: AnyError, res?: UpdateResult) => {
            if (err) throw err;
            db.close();
            return `${JSON.stringify(job)} has been updated`;
        });
    });
};
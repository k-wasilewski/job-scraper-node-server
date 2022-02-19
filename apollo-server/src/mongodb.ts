import {AnyError, InsertOneResult} from "mongodb";
// @ts-ignore
import {MongoClient} from "mongodb/mongodb";

const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const URL = 'mongodb://localhost:27017';
const DB = 'scraping_db';
const COLLECTION = 'fake_users';

interface User {
    id: string;
    title: string;
    completed: boolean;
}

interface UserWithOperation extends User {
    operation: UserOperation;
}

export const addDbUser = (user: User) => {
    const userToAdd: UserWithOperation = {id: user.id, title: user.title, completed: user.completed, operation: UserOperation.ADD};
    return insertToProducts(userToAdd);
}

export const deleteDbUser = (user: User) => {
    const userToDelete: UserWithOperation = {id: user.id, title: user.title, completed: user.completed, operation: UserOperation.DELETE};
    return insertToProducts(userToDelete);
}

enum UserOperation {
    ADD, DELETE
}

const insertToProducts = (object: Object) => {
    return MongoClient.connect(URL, (err?: AnyError, db?: MongoClient) => {
        if (err) throw err;
        const dbo = db.db(DB);
        dbo.collection(COLLECTION).insertOne(object, (err?: AnyError, res?: InsertOneResult) => {
           if (err) throw err;
           db.close();
           return `${JSON.stringify(object)} has been inserted`;
        });
    });
};
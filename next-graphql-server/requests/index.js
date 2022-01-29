import axios from "axios";

const APOLLO_SERVER_ENDPOINT = "http://localhost:3000/api/graphql";
const APOLLO_SUBSCRIPTION_SERVER_ENDPOINT = "http://localhost:8080/graphql";

const getHelloToSubscriptionData = () => {
    return { "query": "{ hello { content } }"};
};

const getUsersData = () => {
    return { "query": "{  getUsers { id, title, completed } }" };
};

const getUserData = (id) => {
    return { "query": `{  getUser(id: \"${id}\") { id, title, completed } }` };
}

const getFakeusersData = (id) => {
    return { "query": `{  getFakeUsers { id, title, completed } }` };
}

const deleteFakeuserData = (id) => {
    return { "query": `mutation { deleteFakeUser(id: \"${id}\") { id, title, completed } }`};
}

const addFakeUserData = (id, title) => {
    return { "query": `mutation { addFakeUser(id: \"${id}\", title: \"${title}\") { id, title, completed } }`};
}

export const getUsers = () => {
    return axios.post(APOLLO_SERVER_ENDPOINT, getUsersData());
}

export const getUser = (id) => {
    return axios.post(APOLLO_SERVER_ENDPOINT, getUserData(id));
}

export const addFakeUser = (id, title) => {
    return axios.post(APOLLO_SERVER_ENDPOINT, addFakeUserData(id, title));
}

export const getFakesers = () => {
    return axios.post(APOLLO_SERVER_ENDPOINT, getFakeusersData());
}

export const deleteFakeUser = (id) => {
    return axios.post(APOLLO_SERVER_ENDPOINT, deleteFakeuserData(id));
}

export const helloToSubscription = () => {
    return axios.post(APOLLO_SUBSCRIPTION_SERVER_ENDPOINT, getHelloToSubscriptionData());
}
import axios from "axios";

const getUsersData = () => {
    return { "query": "{  getUsers { id, title, completed } }" }
};

const getUserData = (id) => {
    return { "query": `{  getUser(id: \"${id}\") { id, title, completed } }` };
}

const getFakeusersData = (id) => {
    return { "query": `{  getFakeUsers { id, title, completed } }` };
}

const addFakeUserData = (id, title) => {
    return { "mutation": `{  addFakeUser(id: \"${id}\", title: \"${title}\") { id, title, completed } }` };
}

export const getUsers = () => {
    return axios.post('http://localhost:3000/api/graphql', getUsersData());
}

export const getUser = (id) => {
    return axios.post('http://localhost:3000/api/graphql', getUserData(id));
}

export const addFakeUser = (id, title) => {
    return axios.post('http://localhost:3000/api/graphql', addFakeUserData(id, title));
}

export const getFakesers = () => {
    return axios.post('http://localhost:3000/api/graphql', getFakeusersData());
}
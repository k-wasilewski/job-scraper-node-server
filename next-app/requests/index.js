import axios from "axios";

const APOLLO_SERVER_ENDPOINT = "http://localhost:8080/graphql";
const SPRING_SERVER_ENDPOINT = "http://localhost:8081/graphql";

const deleteSpringProductData = (id) => {
    return { "query": `mutation { deleteProduct(id: ${id}) { id, content } }`};
};

const addSpringProductData = (content) => {
    return { "query": `mutation { addProduct(content: \"${content}\") { id, content } }`};
};

const getSpringProductData = (id) => {
    return { "query": `{ getProduct(id: ${id}) { id, content } }`};
};

const getSpringProductsData = () => {
    return { "query": "{ getAllProducts { id, content } }"};
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

export const getSpringProducts = () => {
    return axios.post(SPRING_SERVER_ENDPOINT, getSpringProductsData());
}

export const findSpringProductById = (id) => {
    return axios.post(SPRING_SERVER_ENDPOINT, getSpringProductData(id));
}

export const addSpringProduct = (content) => {
    return axios.post(SPRING_SERVER_ENDPOINT, addSpringProductData(content));
}

export const deleteSpringProduct = (content) => {
    return axios.post(SPRING_SERVER_ENDPOINT, deleteSpringProductData(content));
}
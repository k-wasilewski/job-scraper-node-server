import axios from "axios";

const fakeDatabase = {
    users: [
        {
            id: "-1",
            title: "FAKE USERR",
            complete: false
        }
    ]
}

export const resolvers = {
    Query: {
        getUsers: async () => {
            try {
                const users = await axios.get("https://jsonplaceholder.typicode.com/todos");
                return users.data.map(({ id, title, completed }) => ({
                    id,
                    title,
                    completed
                }));
            } catch (error) {
                throw error;
            }
        },
        getUser: async (_, args) => {
            try {
                const user = await axios.get(
                    `https://jsonplaceholder.typicode.com/todos/${args.id}`
                );
                return {
                    id: user.data.id,
                    title: user.data.title,
                    completed: user.data.completed
                };
            } catch (error) {
                throw error;
            }
        },
        getFakeUsers: async () => {
            try {
                return fakeDatabase.users;
            } catch (error) {
                throw error;
            }
        }
    },
    Mutation: {
        addFakeUser: async (_, {id, title}, {dataSources}) => {
            const user = {
                id: id,
                title: title,
                completed: true
            };
            fakeDatabase.users.push(user);
            return user;
        },
    }
};
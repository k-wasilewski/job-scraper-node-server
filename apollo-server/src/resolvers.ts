import axios from "axios";
import { PubSub } from "graphql-subscriptions";

const pubsub = new PubSub();

const fakeDatabase = {
  users: [
    {
      id: "-1",
      title: "FAKE USERR",
      completed: false
    }
  ]
}


let i = 0;

setInterval(() => {
  pubsub.publish('news', { news: { content: `info-${i++}`} });
}, 5000);

export default {
  Query: {
    hello: () => {
      pubsub.publish('news', { news: { content: `info-hello`} });

      return { content: 'siemanko' }
    },
    getUsers: async () => {
      try {
        const users = await axios.get("https://jsonplaceholder.typicode.com/todos");
        return users.data.map((user: { id: string, title: string, completed: boolean }) => {
          const { id, title, completed } = user;

          return {
            id,
            title,
            completed
          }
        });
      } catch (error) {
        throw error;
      }
    },
    getUser: async (_: any, args: { id: string }) => {
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
    addFakeUser: async (_: any, args: { id: string, title: string }, __: any) => {
      const user = {
        id: args.id,
        title: args.title,
        completed: true
      };
      fakeDatabase.users.push(user);
      return user;
    },
    deleteFakeUser: async (_: any, args: { id: string }, __: any) => {
      var removeIndex = fakeDatabase.users.map(u => u.id).indexOf(args.id);
      const user = Object.assign({}, fakeDatabase.users.find((user, i) => {
        return user.id === args.id;
      }));
      if (removeIndex !== -1) fakeDatabase.users.splice(removeIndex, 1);
      return user;
    },
  },
  Subscription: {
    news: {
      subscribe: () => pubsub.asyncIterator(['news'])
    }
  }
};

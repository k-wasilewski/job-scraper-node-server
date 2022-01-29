import { PubSub } from "graphql-subscriptions";

const pubsub = new PubSub();

let i = 0;

setInterval(() => {
  pubsub.publish('news', { news: { content: `info-${i++}`} });
}, 5000);

export default {
  Query: {
    hello: () => {
      pubsub.publish('news', { news: { content: `info-hello`} });

      return { content: 'siemanko' }
    }
  },
  Subscription: {
    news: {
      subscribe: () => pubsub.asyncIterator(['news'])
    }
  }
};

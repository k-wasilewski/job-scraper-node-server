import { PubSub } from "graphql-subscriptions";
import {scrape} from './scraper';
import {getDirectories, getFilenames, removeFile} from "./utils";
//TODO: run scraper on Spring's request and notify dashboard how many new offers were found, keep results in db
export const pubsub = new PubSub();

export default {
  Query: {
    getGroupNames: async () => {
      try {
        return { names: getDirectories('C:/Users/SG0313107/Documents/next-graphql-server/apollo-server/screenshots') };
      } catch (error) {
        throw error;
      }
    },
    getScreenshotsByGroup: async (_: any, args: {
      groupName: string,
    }, __: any) => {
      try {
        return { files: getFilenames(`C:/Users/SG0313107/Documents/next-graphql-server/apollo-server/screenshots/${args.groupName}`) };
      } catch (error) {
        throw error;
      }
    },
  },
  Mutation: {
    scrape: async (_: any, args: {
      host: string,
      path: string,
      jobAnchorSelector: string,
      jobLinkContains: string,
      numberOfPages: number,
      }, __: any) => {
      const _host = args.host.replace(/&quot/g, '"');
      const _path = args.path.replace(/&quot/g, '"');
      const _jobAnchorSelector = args.jobAnchorSelector.replace(/&quot/g, '"');
      const _jobLinkContains = args.jobLinkContains.replace(/&quot/g, '"');
      return await scrape(_host, _path, _jobAnchorSelector, _jobLinkContains, args.numberOfPages)
    },
    removeScreenshotByGroupAndUuid: async (_: any, args: {
      groupName: string,
      uuid: string
    }, __: any) => {
      try {
        removeFile(`C:/Users/SG0313107/Documents/next-graphql-server/apollo-server/screenshots/${args.groupName}/_${args.uuid}.png`)
        return { deleted: removeFile(`C:/Users/SG0313107/Documents/next-graphql-server/apollo-server/screenshots/${args.groupName}/${args.uuid}.png`) };
      } catch (error) {
        throw error;
      }
    }
  },
  Subscription: {
    newJobs: {
      subscribe: () => pubsub.asyncIterator(['newJobs'])
    }
  }
};

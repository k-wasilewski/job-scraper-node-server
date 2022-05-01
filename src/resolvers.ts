import { PubSub } from "graphql-subscriptions";
import {scrape} from './scraper';
import {getDirectories, getFilenames, removeFile} from "./utils";
import {SCREENSHOTS_PATH} from "./server";
import {deleteJobByUuid} from "./mongodb";

export const pubsub = new PubSub();

export default {
  Query: {
    getGroupNames: async () => {
      try {
        return { names: getDirectories(SCREENSHOTS_PATH) };
      } catch (error) {
        throw error;
      }
    },
    getScreenshotsByGroup: async (_: any, args: {
      groupName: string,
    }, __: any) => {
      try {
        return { files: getFilenames(`${SCREENSHOTS_PATH}/${args.groupName}`) };
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
        const scrRemoved = removeFile(`${SCREENSHOTS_PATH}/${args.groupName}/_${args.uuid}.png`);
        const jobRemoved = deleteJobByUuid(args.uuid);
        return { deleted: scrRemoved && jobRemoved };
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

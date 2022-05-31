import { PubSub } from "graphql-subscriptions";
import {scrape} from './scraper';
import {getDirectories, getFilenames, removeDir, removeFile} from "./utils";
import {SCREENSHOTS_PATH} from "./server";
import {deleteJobByUuid, User} from "./mongodb";
import {login, register} from "./auth";

export const pubsub = new PubSub();

export default {
  Query: {
    getGroupNames: async (_: any, args: {}, context: { user: User }) => {
      if (!context.user) throw authError('Unauthorized');
      try {
        return { names: getDirectories(SCREENSHOTS_PATH) };
      } catch (error) {
        throw error;
      }
    },
    getScreenshotsByGroup: async (_: any, args: {
      groupName: string,
    }, context: { user: User }) => {
      if (!context.user) throw authError('Unauthorized');
      try {
        return { files: getFilenames(`${SCREENSHOTS_PATH}/${args.groupName}`) };
      } catch (error) {
        throw error;
      }
    },
    verify: async (_: any, args: {}, context: { user: User }) => {
      if (!context.user) throw authError('Unauthorized');
      try {
        return { user: context.user };
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
      }, context: { user: User }) => {
      if (!context.user) throw authError('Unauthorized');

      const _host = args.host.replace(/&quot/g, '"');
      const _path = args.path.replace(/&quot/g, '"');
      const _jobAnchorSelector = args.jobAnchorSelector.replace(/&quot/g, '"');
      const _jobLinkContains = args.jobLinkContains.replace(/&quot/g, '"');
      return await scrape(_host, _path, _jobAnchorSelector, _jobLinkContains, args.numberOfPages)
    },
    removeScreenshotByGroupAndUuid: async (_: any, args: {
      groupName: string,
      uuid: string
    }, context: { user: User }) => {
      if (!context.user) throw authError('Unauthorized');
      try {
        const scrRemoved = removeFile(`${SCREENSHOTS_PATH}/${args.groupName}/${args.uuid}.png`);
        const jobRemoved = deleteJobByUuid(args.uuid);
        return { deleted: scrRemoved && jobRemoved };
      } catch (error) {
        throw error;
      }
    },
    removeAllScreenshotsByGroup: async (_: any, args: {
      groupName: string
    }, context: { user: User}) => {
      if (!context.user) throw authError('Unauthorized');
      try {
        const jobsOfGroup = getFilenames(`${SCREENSHOTS_PATH}/${args.groupName}`);
        const jobsToRemove = jobsOfGroup.length;
        let jobsRemoved = 0;
        jobsOfGroup.forEach(jobUuid => {
          removeFile(`${SCREENSHOTS_PATH}/${args.groupName}/${jobUuid}.png`);
          deleteJobByUuid(jobUuid);
          jobsRemoved++;
        });
        const success = jobsToRemove === jobsRemoved;
        if (success) removeDir(`${SCREENSHOTS_PATH}/${args.groupName}`);
        return { deleted: success };
      } catch (error) {
        throw error;
      }
    },
    login: async (_: any, args: {
      email: string,
      password: string
    }, {req}: any) => {
      try {
        const { success, error, token, user } = await login(args.email, args.password);
        if (success && token && user) {
          req.res.cookie('authToken', token, {
            httpOnly: true,
            maxAge: 2 * 60 * 60 * 1000
          });
          return { success, code: 200, user };
        } else if (error) {
          throw clientError(error.message);
        }
      } catch (error) {
        throw serverError(error.message);
      }
    },
    register: async (_: any, args: {
      email: string,
      password: string
    }, {req}: any) => {
      try {
        const { success, error, token, user } =  await register(args.email, args.password);
        if (success && token && user) {
          req.res.cookie('authToken', token, {
            httpOnly: true,
            maxAge: 2 * 60 * 60 * 1000
          });
          return { success, code: 200, user };
        } else if (error) {
          throw clientError(error.message);
        }
      } catch (error) {
        throw serverError(error.message);
      }
    }
  },
  Subscription: {
    newJobs: {
      subscribe: (_: any, args: {}, context: { user: User }) => {
        if (!context.user) throw authError('Unauthorized');
        return pubsub.asyncIterator(['newJobs'])
      }
    }
  }
};

const clientError = (msg: string) =>
    new Error(JSON.stringify({
      success: false,
      code: 400,
      msg
    }));

const serverError = (msg: string) =>
    new Error(JSON.stringify({
      success: false,
      code: 500,
      msg
    }));

const authError = (msg: string) =>
    new Error(JSON.stringify({
      success: false,
      code: 403,
      msg
    }));
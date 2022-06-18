import { PubSub } from "graphql-subscriptions";
import {scrape} from './scraper';
import {getDirectories, getFilenames, removeDir, removeFile, sameMembers} from "./utils";
import {getUsersScreenshotsPath} from "./server";
import {deleteJobByUuid, findGroupNames, findJobsByGroupName, Job, User} from "./mongodb";
import {login, register, SPRING_SCRAPE_UUID} from "./auth";

export const pubsub = new PubSub();

export default {
  Query: {
    getGroupNames: async (_: any, args: {}, context: { user: User }) => {
      if (!context.user) throw authError('Unauthorized');
      try {
        const dir = getUsersScreenshotsPath(context.user.uuid);
        const fsNames = getDirectories(dir);
        const dbNames = await findGroupNames(context.user.uuid);
        if (!sameMembers(fsNames, dbNames)) throw Error('Database and filesystem mismatch!');

        return { names: fsNames };
      } catch (error) {
        throw error;
      }
    },
    getScreenshotsByGroup: async (_: any, args: {
      groupName: string,
    }, context: { user: User }) => {
      if (!context.user) throw authError('Unauthorized');
      try {
        const dir = getUsersScreenshotsPath(context.user.uuid);
        const fsNames = getFilenames(`${dir}/${args.groupName}`);
        const dbJobs: Job[] = await findJobsByGroupName(context.user.uuid, args.groupName);
        const dbNames = dbJobs.map(job => job.uuid);
        if (!sameMembers(fsNames, dbNames)) throw Error('Database and filesystem mismatch!');

        return { files:  fsNames};
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
      userUuid?: string
      }, context: { user: User }) => {
      if (!context.user) throw authError('Unauthorized');
      if (context.user.uuid !== SPRING_SCRAPE_UUID && context.user.uuid !== args.userUuid) throw authError('Unauthorized');

      const _host = args.host.replace(/&quot/g, '"');
      const _path = args.path.replace(/&quot/g, '"');
      const _jobAnchorSelector = args.jobAnchorSelector.replace(/&quot/g, '"');
      const _jobLinkContains = args.jobLinkContains.replace(/&quot/g, '"');
      return await scrape(_host, _path, _jobAnchorSelector, _jobLinkContains, args.numberOfPages, args.userUuid)
    },
    removeScreenshotByGroupAndUuid: async (_: any, args: {
      groupName: string,
      uuid: string
    }, context: { user: User }) => {
      if (!context.user) throw authError('Unauthorized');
      try {
        const dir = getUsersScreenshotsPath(context.user.uuid);
        const scrRemoved = removeFile(`${dir}/${args.groupName}/${args.uuid}.png`);
        const jobRemoved = await deleteJobByUuid(context.user.uuid, args.uuid);
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
        const dir = getUsersScreenshotsPath(context.user.uuid);
        const jobsOfGroup = getFilenames(`${dir}/${args.groupName}`);
        jobsOfGroup.forEach(jobUuid => {
          removeFile(`${dir}/${args.groupName}/${jobUuid}.png`);
          deleteJobByUuid(context.user.uuid, jobUuid);
        });
        removeDir(`${dir}/${args.groupName}`);
        return { deleted: true };
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
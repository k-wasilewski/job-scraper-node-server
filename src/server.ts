import { ApolloServer } from 'apollo-server-express';
import * as GraphiQL from 'apollo-server-module-graphiql';
import * as cors from 'cors';
import * as express from 'express';
import schema from './schema';
import { execute, subscribe } from 'graphql';
import { createServer, Server } from 'http';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import * as url from 'url';
import * as path from "path";
import {getSpringScrapeUserFromToken, getUserFromToken} from "./auth";
import {findUserByEmail} from "./mongodb";
import {Response} from "express";
import cookieParser from 'cookie-parser';

type ExpressGraphQLOptionsFunction = (req?: express.Request, res?: express.Response) => any | Promise<any>;

function graphiqlExpress(options: GraphiQL.GraphiQLData | ExpressGraphQLOptionsFunction) {
  const graphiqlHandler = (req: express.Request, res: express.Response, next: any) => {
    const query = req.url && url.parse(req.url, true).query;
    GraphiQL.resolveGraphiQLString(query, options, req).then(
      (graphiqlString: any) => {
        res.setHeader('Content-Type', 'text/html');
        res.write(graphiqlString);
        res.end();
      },
      (error: any) => next(error)
    );
  };

  return graphiqlHandler;
}

export const SCREENSHOTS_PATH = path.join(__dirname, '..', 'screenshots');

export const getUsersScreenshotsPath = (uuid: string) => {
    return path.join(SCREENSHOTS_PATH, uuid);
}

export default async (port: number): Promise<Server> => {
  const app = express();

  const server: Server = createServer(app);

  app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

  app.use('/screenshots', express.static(SCREENSHOTS_PATH));

  app.use(cookieParser());

  const apolloServer = new ApolloServer({
    playground: false,
    schema,
    context: async ({ req, res }: { req: RequestWithCookies, res: Response }) => {
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
        if (!(req.body as GraphqlBody).query.match(/mutation( )*{( )*register( )*\(/) &&
            !(req.body as GraphqlBody).query.match(/mutation( )*{( )*login( )*\(/) &&
            req.headers['origin'] !== 'job-scraper-spring-server:8081') {
            const token = req.cookies.authToken || '';
            const user = await getUserFromToken(token);
            return { user };
        } else if (!(req.body as GraphqlBody).query.match(/mutation( )*{( )*register( )*\(/) &&
            !(req.body as GraphqlBody).query.match(/mutation( )*{( )*login( )*\(/) &&
            req.headers['origin'] === 'job-scraper-spring-server:8081') {
            const token = req.cookies.authToken || '';
            const user = getSpringScrapeUserFromToken(token);
            return { user };
        } else return { req };
    },
  });

  apolloServer.applyMiddleware({ app, path: '/graphql' });

  if (module.hot) {
    app.use(
      '/graphiql',
      graphiqlExpress({
        endpointURL: '/graphql',
        query:
          '# Welcome to your own GraphQL server!\n#\n' +
          '# Press Play button above to execute GraphQL query\n#\n' +
          '# You can start editing source code and see results immediately\n\n' +
          'query hello($subject:String) {\n  hello(subject: $subject)\n}',
        subscriptionsEndpoint: `ws://localhost:${port}/subscriptions`,
        variables: { subject: 'World' }
      })
    );
  }

  return new Promise<Server>(resolve => {
    server.listen(port, () => {
      // tslint:disable-next-line
      new SubscriptionServer(
        {
          execute,
          schema,
          subscribe,
            onConnect: async (
                connectionParams: IWebSocketConnectionParams,
                webSocket: IWebSocket
            ) => {
              const token = getAuthCookie(webSocket.upgradeReq.headers.cookie);
                if (token) {
                    const user = await getUserFromToken(token);
                    const _user = findUserByEmail(user.email);
                    if (_user) {
                        return {
                            user
                        };
                    }
                }
            }
        },
        {
          path: '/subscriptions',
          server
        }
      );
      resolve(server);
    });
  });
};

const getAuthCookie = (str: string) => {
    const authTokenMa = /(^|; )authToken=([^;]*)($|;)/.exec(str);
    const authToken = authTokenMa ? authTokenMa[2] : null;
    return authToken ? authToken.charAt(authToken.length-1) === ';' ? authToken.slice(0, -1) : authToken : null;
}

interface RequestWithCookies extends Request {
    cookies: { authToken: string };
}

interface GraphqlBody extends ReadableStream<Uint8Array> {
    query: string;
}

interface IWebSocketConnectionParams {
    token: string;
}

interface IWebSocket {
    upgradeReq: {
        headers: {
            cookie: any
        }
    }
}
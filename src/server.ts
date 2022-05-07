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
import {getUserFromToken} from "./auth";
import {findUserByEmail} from "./mongodb";

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

export default async (port: number): Promise<Server> => {
  const app = express();

  const server: Server = createServer(app);

  app.use('*', cors({ origin: 'http://localhost:3000' }));

  app.use('/screenshots', express.static(SCREENSHOTS_PATH))

  const apolloServer = new ApolloServer({
    playground: false,
    schema,
    context: ({ req }: { req: Request }) => {
        if (!(req.body as GraphqlBody).query.match(/mutation( )*{( )*register( )*\(/) &&
            !(req.body as GraphqlBody).query.match(/mutation( )*{( )*login( )*\(/)) {
            const token = (req.headers as HeadersWithAuth).authorization.split(' ')[1] || '';
            const user = getUserFromToken(token);
            return { user };
        }
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
                connectionParams: IWebSocketConnectionParams
            ) => {
                if (connectionParams.token) {
                    const user = await getUserFromToken(connectionParams.token);
                    const _user = findUserByEmail(user.email);
                    if (_user) {
                        const context = {
                            subscribeUser: _user
                        }
                        return context;
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

interface HeadersWithAuth extends Headers {
    authorization: string;
}

interface GraphqlBody extends ReadableStream<Uint8Array> {
    query: string;
}

interface IWebSocketConnectionParams {
    token: string;
}
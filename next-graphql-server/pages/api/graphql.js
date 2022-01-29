import  { ApolloServer }  from  "apollo-server-micro"; //TODO: apollo-server-micro doesn't support subscriptions :/
import  { typeDefs } from "../../schemas";
import  { resolvers }  from "../../resolvers";

const apolloServer = new ApolloServer({ typeDefs, resolvers });

export const config = {
    api: {
        bodyParser: false
    }
};

const startServer = apolloServer.start();

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
        "Access-Control-Allow-Origin",
        "https://studio.apollographql.com"
    );
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Methods, Access-Control-Allow-Origin, Access-Control-Allow-Credentials, Access-Control-Allow-Headers"
    );
    res.setHeader(
        "Access-Control-Allow-Methods",
        "POST, GET, PUT, PATCH, DELETE, OPTIONS, HEAD"
    );
    if (req.method === "OPTIONS") {
        res.end();
        return false;
    }

    await startServer;
    await apolloServer.createHandler({
        path: "/api/graphql",
    })(req, res);
}
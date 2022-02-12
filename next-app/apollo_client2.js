import { ApolloClient, InMemoryCache } from '@apollo/client';
import { split } from "@apollo/client";
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";

const httpLink = new HttpLink({
    uri: 'http://localhost:8081/graphql',
});

const wsLink = process.browser ? new WebSocketLink({
    uri: 'ws://localhost:8081/subscriptions',
    options: {
        reconnect: true
    },
}) : null;

const link = process.browser ? split(
    ({ query }) => {
        const { kind, operation } = getMainDefinition(query);
        return kind === 'OperationDefinition' && operation === 'subscription';
    },
    wsLink,
    httpLink,
) : httpLink;

const cache = new InMemoryCache();

const client = new ApolloClient({ link, cache });

export default client;
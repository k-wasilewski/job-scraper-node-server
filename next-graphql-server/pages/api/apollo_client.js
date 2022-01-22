import { ApolloClient, InMemoryCache } from '@apollo/client';
import { split, HttpLink } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { WebSocketLink } from '@apollo/client/link/ws';
import ws from 'ws';

const httpLink = new HttpLink({
    uri: 'http://localhost:3000/api/graphql'
});

const wsLink = process.browser ? new WebSocketLink({
    uri: 'ws://localhost:3000/api/graphql',
    options: {
        reconnect: true
    },
    ws
}) : null;

const splitLink = process.browser ? split(
    ({ query }) => {
        const definition = getMainDefinition(query);
        return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
        );
    },
    wsLink,
    httpLink,
) : httpLink;

export const client = new ApolloClient({
    link: splitLink,  cache: new InMemoryCache()
});
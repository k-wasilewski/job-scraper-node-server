import { gql } from "apollo-server-micro";
import { NEWS } from "../resolvers";

export const typeDefs  =  gql`
    type  User {
        id: String
        title: String
        completed: Boolean
    }
    
    type NewsItem {
        content: String
    }

    type  Query {
        getUsers: [User]
        getUser(id: String!): User!
        getFakeUsers: [User]
    }
    
    type Mutation {
        addFakeUser(id: String!, title: String!): User!
        deleteFakeUser(id: String!): User!
    }
    
    type Subscription {
        ${NEWS}: [NewsItem]
    }`
import  {  gql  }  from  "apollo-server-micro";

export const typeDefs  =  gql`
    type  User {
        id: String
        title: String
        completed: Boolean
    }

    type  Query {
        getUsers: [User]
        getUser(id: String!): User!
        getFakeUsers: [User]
    }
    
    type Mutation {
        addFakeUser(id: String!, title: String!): User!
    }`
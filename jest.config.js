module.exports = {
  "roots": [
    "<rootDir>"
  ],
  "testMatch": [
    '<rootDir>/test/**',
    '!<rootDir>/src/**'
  ],
  "preset": "ts-jest",
  "transform": {
    "\\.(gql|graphql)$": "@graphql-tools/jest-transform",
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
};
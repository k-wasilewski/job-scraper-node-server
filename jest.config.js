module.exports = {
  "roots": [
    "<rootDir>"
  ],
  "testMatch": [
    '**/test/**',
    '!**/src/**'
  ],
  "preset": "ts-jest",
  "transform": {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
};
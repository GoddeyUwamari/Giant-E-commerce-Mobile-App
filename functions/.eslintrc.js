module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended"
  ],
  parserOptions: {
    ecmaVersion: 2018,
  },
  ignorePatterns: [
    "/lib/**/*",
    "/node_modules/**/*",
  ],
  rules: {
    "no-unused-vars": "off"
  },
};

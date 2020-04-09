module.exports = {
  env: {
    commonjs: true,
    es6: true,
    node: true,
  },
  extends: ["eslint:recommended"],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    quotes: 0,
    "no-console": 0,
    "no-use-before-define": 0,
    "implicit-arrow-linebreak": 0,
    "function-paren-newline": 0,
  },
};

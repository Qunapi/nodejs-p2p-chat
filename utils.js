const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
});

function readlinePromise(message = "") {
  return new Promise((resolve, reject) => {
    rl.question(message, (input) => {
      resolve(input);
    });
  });
}

module.exports = {
  readlinePromise,
};

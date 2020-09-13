const run = require('./update-release');

async function main() {
  try {
    start();
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();

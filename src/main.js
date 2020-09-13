const run = require('./update-release');

async function main() {
  try {
    run();
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();

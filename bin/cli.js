#!/usr/bin/env node

const argv = require('minimist')(process.argv.slice(2));
const { createInterface } = require('../lib');

const config = {};

// i = 1 to skip _
for (let i = 1; i < Object.keys(argv).length; i++) {
  const arg = Object.keys(argv)[i];
  config[arg.replace(/-./g, (x) => x.toUpperCase()[1])] = argv[arg];
}

(async () => {
  const cmd = await createInterface(config);

  console.log(cmd.config);

  if (argv._.length) {
    cmd.command(argv);
  } else {
    cmd.interactive();
  }
})();

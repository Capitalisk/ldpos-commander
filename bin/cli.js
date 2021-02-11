#!/usr/bin/env node

const argv = require('minimist')(process.argv.slice(2));
const { CmdInterface, kebabCaseToCamel } = require('../lib');

const config = {};

// i = 1 to skip _
for (let i = 1; i < Object.keys(argv).length; i++) {
  const arg = Object.keys(argv)[i];
  config[kebabCaseToCamel(arg)] = argv[arg];
}

(async () => {
  config.interactive = !argv._.length || Object.keys(argv).length > 1;

  const cmd = await new CmdInterface(config, argv._.includes('clean'));

  if (config.interactive) {
    cmd.interactive();
  } else {
    cmd.command(argv);
  }
})();

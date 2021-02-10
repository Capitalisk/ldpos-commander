#!/usr/bin/env node

const argv = require('minimist')(process.argv.slice(2));
const { createInterface, CmdInterface } = require('../lib');

const config = {};

// i = 1 to skip _
for (let i = 1; i < Object.keys(argv).length; i++) {
  const arg = Object.keys(argv)[i];
  config[arg.replace(/-./g, (x) => x.toUpperCase()[1])] = argv[arg];
}

(async () => {
  const cmd = await new CmdInterface().init(config);

  console.log(cmd.config);

  console.log('Going to run command:', argv._.length || Object.keys(argv).length < 1)
  console.log('Going to run interactive:', !(argv._.length || Object.keys(argv).length < 1))

  if (argv._.length || Object.keys(argv).length > 1) {
    cmd.command(argv);
  } else {
    cmd.interactive();
  }
})();

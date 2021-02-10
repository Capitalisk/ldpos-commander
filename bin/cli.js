#!/usr/bin/env node

const argv = require('minimist')(process.argv.slice(2));
const { CmdInterface } = require('../lib');

const config = {}

// i = 1 to skip _
for (let i = 1; i < Object.keys(argv).length; i++) {
  const arg = Object.keys(argv)[i];
  config[arg.replace(/-./g, x=>x.toUpperCase()[1])] = argv[arg]
}

const interface = new CmdInterface(config);

(async () => {
  if (argv.hostname) {
    if (typeof argv.hostname === 'string' && argv.hostname.split('.').length === 5)
      interface.command(argv)
  }
})();

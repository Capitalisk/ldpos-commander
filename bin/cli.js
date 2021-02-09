#!/usr/bin/env node

const fs = require('fs-extra');
const argv = require('minimist')(process.argv.slice(2));
const ldposClient = require('ldpos-client');

const {
  promptInput,
  exec,
  spawn,
  fork,
  configPath,
  errorLog,
  passphrasePrompt,
} = require('../lib/index');

const configFile = 'ldpos-config.json';
const fullConfigPath = `${configPath}${configFile}`;

let command = argv._[0];

const getConfig = async () => {
  let config;

  if (await fs.pathExists(fullConfigPath)) {
    // If config file exists use config data
    config = require(fullConfigPath);
  } else {
    // If not exists prompt questions
    // prettier-ignore
    hostname = await promptInput('Server IP: (Default: 34.227.22.98)') || '34.227.22.99';
    // prettier-ignore
    port = await promptInput('Port: (Default: 7001)') || 7001;
    // prettier-ignore
    networkSymbol = await promptInput('Network symbol: (Default: ldpos)') || 'ldpos';
    // prettier-ignore
    save = ['Y', 'y'].includes(await promptInput(`Save in your home dir? (Y/n)`));

    config = {
      hostname,
      port,
      networkSymbol,
    };

    if (save)
      await fs.outputFile(fullConfigPath, JSON.stringify(config, null, 2));
  }

  return Promise.resolve(config);
};

const accountBalance = async (client) => {
  // clerk aware give dog reopen peasant duty cheese tobacco trouble gold angle
  const accounts = await client.getAccountsByBalance(0, 100);
  console.log('ACCOUNTS:', accounts);
};

// prettier-ignore
const log = () => {
  console.log('Usage: ldpos [OPTIONAL: ip:port] [options] [command]\n');
  console.log('Options:');
  console.log('  -v            Get the version of the current LDPoS installation');
  console.log('  --help        Get info on how to use this command');
  console.log('  --force       Force all necessary directory modifications without prompts');
  console.log();
  console.log('Commands:');
  console.log('  remove            Removes config file with server ip, port and networkSymbol');
  console.log('');
};

(async () => {
  // Switch case for commands
  const sw = {
    remove: async () => await fs.remove(fullConfigPath),
    balance: async () => await accountBalance(client),
    '--help': async () => log(),
    '-v': async () => console.log(require('./package.json').version),
    default: async () => log(),
  };

  try {
    if (command === 'remove') {
      await sw.remove()
      return
    }

    // Get config if existent in home dir or create config object
    const config = await getConfig();

    // Get passphrase of the wallet
    const passphrase = await passphrasePrompt();

    let client;

    // If command is an ip execute it on another server
    if (command.split('.').length === 4) {
      const hostname = command.split(':')[0];
      const port = command.split(':')[0] || 7001;
      command = argv._[1];

      client = ldposClient.createClient({ ...config, hostname, port });
    } else {
      client = ldposClient.createClient(config);
    }
    await client.connect({
      passphrase,
    });


    await (sw[command] || sw.default)();
    process.exit();
  } catch (e) {
    errorLog(e.message);
  }
})();

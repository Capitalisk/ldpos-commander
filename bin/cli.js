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
} = require('../lib/index');

const configFile = 'ldpos-config.json';
const fullConfigPath = `${configPath}${configFile}`;

const command = argv._[0];

let config, client;

const getConfigAndConnect = async () => {
  let hostname, port, networkSymbol, save, test, passphrase

  if (await fs.pathExists(fullConfigPath)) {
    // If config file exists use config data
    config = require(fullConfigPath);
  } else {
    // If not exists prompt questions
    // prettier-ignore
    hostname = await promptInput('Server IP: (Default: 34.227.22.98)') || '34.227.22.98';
    // prettier-ignore
    port = await promptInput('Port: (Default: 7001)') || 7001;
    // prettier-ignore
    networkSymbol = await promptInput('Network symbol: (Default: ldpos)') || 'ldpos';
    // prettier-ignore
    save = ['Y', 'y'].includes(await promptInput(`Save in your home dir? (Y/n)`));
    test = ['Y', 'y'].includes(await promptInput(`Get your account balance as a test? (Y/n)`));
    passphrase = await promptInput('Passphrase:');

    config = {
      hostname,
      port,
      networkSymbol,
    };

    if (save)
      await fs.outputFile(
        fullConfigPath,
        JSON.stringify({ ...config, passphrase }, null, 2)
      );
  }

  try {
    client = ldposClient.createClient(config);

    // TODO: testing purposes
    passphrase = 'clerk aware give dog reopen peasant duty cheese tobacco trouble gold angle'

    if(passphrase) {
      await client.connect({
        passphrase,
      });
    }

    if(test) {
      const accounts = await client.getAccountsByBalance(0, 100);
      console.log('ACCOUNTS:', accounts);
    }
  } catch (e) {
    console.log(e)
    errorLog(e.message);
  }
};

// prettier-ignore
const log = () => {
  console.log('Usage: ldpos [options] [command]\n');
  console.log('Options:');
  console.log('  -v            Get the version of the current LDPoS installation');
  console.log('  --help        Get info on how to use this command');
  console.log('  --force       Force all necessary directory modifications without prompts');
  console.log();
  console.log('Commands:');
  console.log('  config            Sets up your config to connect to the blockchain');
  console.log('');
};

(async () => {
  try {
    const sw = {
      config: async () => await getConfigAndConnect(),
      '--help': async () => log(),
      '-v': async () => console.log(require('./package.json').version),
      default: async () => log(),
    };

    await (sw[command] || sw.default)();
    process.exit();
  } catch (e) {
    errorLog(e.message);
  }
})();

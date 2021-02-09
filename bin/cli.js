#!/usr/bin/env node

const fs = require('fs-extra');
const argv = require('minimist')(process.argv.slice(2));
const childProcess = require('child_process');
const ldposClient = require('ldpos-client');
const inquirer = require('inquirer');
const prompt = inquirer.createPromptModule();
const util = require('util');
const exec = util.promisify(childProcess.exec);
const spawn = util.promisify(childProcess.spawn);
const fork = util.promisify(childProcess.fork);

const configPath =
  `${process.env.APPDATA}\\` ||
  (process.platform == 'darwin'
    ? process.env.HOME + '/Library/Preferences/'
    : process.env.HOME + '/.local/share/');
const configFile = 'ldpos-config.json';
const fullConfigPath = `${configPath}${configFile}`;

const command = argv._[0];

let config, client;

const getConfigAndConnect = async () => {
  if (fs.existsSync(fullConfigPath)) {
    config = require(fullConfigPath);
  } else {
    // If not exists prompt questions
    hostname = await prompt('Server IP:');
    port = await prompt('Port:');
    networkSymbol = await prompt('Network symbol:');
    save = await prompt('Save in your home dir? (${configPath + config})');
    passphrase = await prompt('Passphrase:');

    config = {
      hostname,
      port,
      networkSymbol,
    };

    if (save)
      fs.writeFileSync(
        fullConfigPath,
        JSON.stringify({ ...config, passphrase }, null, 2)
      );
  }

  client = ldposClient.createClient(config);

  await client.connect({
    passphrase,
  });
};

const log = () => {
  console.log('Usage: ldpos [options] [command]\n');
  console.log('Options:');
  console.log("  -v            Get the version of the current LDPoS installation");
  console.log('  --help        Get info on how to use this command');
  console.log('  --force       Force all necessary directory modifications without prompts');
  console.log();
  console.log('Commands:');
  console.log('  config            Sets up your config to connect to the blockchain');
  console.log('');
}

(async () => {
  const sw = {
    config: async () => await getConfigAndConnect(),
    '--help': async () => log(),
    '-v': async () => console.log(require('./package.json').version),
    default: async () => log(),
  }
  
  await (sw[command] || sw.default)();
})();

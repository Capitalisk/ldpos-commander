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
  networkSymbolPrompt,
} = require('../lib/index');

const { transfer, vote, unvote } = require('../lib/commands');

const configFile = 'ldpos-config.json';
const fullConfigPath = `${configPath}${configFile}`;

let command = argv._[1];
let type = argv._[0];

const getConfig = async () => {
  let config;

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
    networkSymbol = await networkSymbolPrompt()
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
  const accounts = await client.getAccountsByBalance(0, 100);
  console.log('ACCOUNTS:', accounts);
};

// prettier-ignore
const log = () => {
  console.log('Usage: ldpos (OPTIONAL: ip:port) [options] [command]\n');
  console.log('<ip:port>: Default port is 7001. If not provided it will prompt you in the steps.')
  console.log('Options:');
  console.log('  -v                             Get the version of the current LDPoS installation');
  console.log('  --help                         Get info on how to use this command');
  console.log();
  console.log('Commands:');
  console.log('  config:                        Commands for config');
  console.log('     clean                       Removes config file with server ip, port and networkSymbol');
  // console.log('     add                      Removes config file with server ip, port and networkSymbol');
  console.log('  transactions:                  Commands for transactions');
  console.log('     transfer                    Transfer to a wallet');
  console.log('     vote                        Vote a a delegate');
  console.log('     unvote                      Unvote a a delegate');
  console.log('     register-multi-wallet       Register a multisigwallet');
  console.log('     register-sig-details        Register a registerSigDetails');
  console.log('     register-multi-details      Register a registerMultisigDetails');
  console.log('     register-forging-details    Register a registerForgingDetails');
  console.log('  account:                       Commands for your account');
  console.log('     balance                     Check your balance');
  console.log('     public-keys                 Check your public keys');
  console.log('');
};

(async () => {
  // Switch case for commands
  const sw = {
    config: {
      clean: async () => await fs.remove(fullConfigPath),
    },
    transaction: {
      transfer: async (opts) => await transfer(opts),
      vote: async (opts) => await vote(opts),
      unvote: async (opts) => await unvote(opts),
    },
    account: {
      balance: async (opts) => await accountBalance(opts),
    },
    help: async () => log(),
    v: async () =>
      console.log(`Version: ${require('../package.json').version}`),
    default: async () => log(),
  };

  try {
    if (type === 'config' && command === 'clean') {
      await sw.config.clean();
      return;
    }

    if (!command) {
      // 1 because first entry always is _
      for (let i = 1; i < Object.keys(argv).length; i++) {
        const arg = Object.keys(argv)[i];
        if (sw.hasOwnProperty(arg)) {
          sw[arg]();
          return;
        } else {
          errorLog(
            'Command is not found. Run ldpos --help to see all available commands.'
          );
        }
      }
    }

    let config;

    // If command is an ip execute it on another server
    if (command && command.includes('.') && command.split('.').length === 4) {
      const hostname = command.split(':')[0];
      const port = command.split(':')[1] || 7001;
      const networkSymbol = await networkSymbolPrompt();
      command = argv._[2];
      type = argv._[1];

      config = { networkSymbol, hostname, port };
    } else {
      // Get config if existent in home dir or create config object
      config = await getConfig();
    }

    // Execute given command
    if (sw[type]) {
      // Get passphrase of the wallet
      const passphrase = await passphrasePrompt();

      const client = ldposClient.createClient(config);

      await client.connect({
        passphrase,
      });
      await (sw[type][command] || sw.default)({ client, passphrase });
    } else {
      errorLog(
        'Command is not found. Run ldpos --help to see all available commands.'
      );
    }
    process.exit();
  } catch (e) {
    debugger;
    errorLog(e.message);
  }
})();

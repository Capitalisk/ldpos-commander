const fs = require('fs-extra');
const childProcess = require('child_process');
const inquirer = require('inquirer');
const prompt = inquirer.createPromptModule();
const util = require('util');
const ldposClient = require('ldpos-client');

class CmdInterface {
  constructor(config = {}, argv) {
    return (async () => {
      const clean = argv._.includes('clean');
      const exceptionCommands = ['help', 'v', 'version']
        .map((f) => argv.hasOwnProperty(f))
        .includes(true);

      this.config = config;

      // Gets users home dir to store config files
      const configPath = process.env.APPDATA
        ? `${process.env.APPDATA}\\`
        : process.platform == 'darwin'
        ? process.env.HOME + '/Library/Preferences/'
        : process.env.HOME + '/.local/share/';
      const configFile = 'ldpos-config.json';
      this.fullConfigPath = `${configPath}${configFile}`;
      this.actions = require('./actions');

      this.commands = this.getCommands();

      // If command is an ip change config to that IP
      if (
        argv._[0] &&
        argv._[0].includes('.') &&
        argv._[0].split('.').length === 4
      ) {
        const hostname = argv._[0].split(':')[0];
        const port = argv._[0].split(':')[1] || 7001;

        this.config = { hostname, port };
      }

      if (!clean && !exceptionCommands) {
        if (!this.config.hostname) {
          if (await fs.pathExists(this.fullConfigPath)) {
            this.config = require(this.fullConfigPath);
          } else {
            // prettier-ignore
            this.config = {
              ...this.config,
              hostname: await this.promptInput('Server IP:') || '34.227.22.98',
              port: await this.promptInput('Port: (Default: 7001)') || 7001,
            };

            const save = ['Y', 'y'].includes(
              await this.promptInput(`Save in your home dir? (Y/n)`)
            );

            if (save)
              await fs.outputFile(
                this.fullConfigPath,
                JSON.stringify(config, null, 2)
              );
          }
        }

        if (!this.config.networkSymbol) {
          this.config = {
            ...this.config,
            networkSymbol:
              (await this.promptInput('Network symbol: (Default: ldpos)')) ||
              'ldpos',
          };
        }

        // Get passphrase of the wallet
        this.passphrase =
          (await this.promptInput('Passphrase:', true)) ||
          'clerk aware give dog reopen peasant duty cheese tobacco trouble gold angle';
        this.client = ldposClient.createClient(this.config);

        try {
          await this.client.connect({
            passphrase: this.passphrase,
          });
        } catch (e) {
          this.errorLog("Can't connect to socket");
        }
      }

      for (let i = 0; i < Object.keys(this.actions).length; i++) {
        const key = Object.keys(this.actions)[i];
        this.actions[key] = this.actions[key].bind(this.actions[key], this);
      }

      return this;
    })();
  }

  async init(config, clean) {
    const options = {};
    if (!config.hostname && !clean) {
      if (await fs.pathExists(this.fullConfigPath)) {
        config = require(this.fullConfigPath);
      } else {
        // prettier-ignore
        config = {
          ...config,
          hostname: await this.promptInput('Server IP:') || '34.227.22.98',
          port: await this.promptInput('Port: (Default: 7001)') || 7001,
          networkSymbol: await this.promptInput('Network symbol: (Default: ldpos)') || 'ldpos',
        };

        const save = ['Y', 'y'].includes(
          await this.promptInput(`Save in your home dir? (Y/n)`)
        );

        if (save)
          await fs.outputFile(
            this.fullConfigPath,
            JSON.stringify(config, null, 2)
          );
      }
    }

    if (!clean) {
      // Get passphrase of the wallet
      options.passphrase =
        (await this.promptInput('Passphrase:', true)) ||
        'clerk aware give dog reopen peasant duty cheese tobacco trouble gold angle';
      options.client = ldposClient.createClient(config);

      try {
        await options.client.connect({
          passphrase: options.passphrase,
        });
      } catch (e) {
        this.errorLog("Can't connect to socket");
      }
    }

    return Promise.resolve(new CmdInterface(config, options));
  }

  getCommands() {
    // !: Larger logic is seperated
    // !: Log output one-liner logic is added to `ldposAction`

    // prettier-ignore
    return {
      login: () => console.log('login'),
      exit: () => this.exit(),
      help: () => Promise.resolve(this.config.interactive ? this.intertactiveLog() : this.commandLog()),
      v: async () => this.successLog(`Version: ${require('../package.json').version}`),
      version: async () => this.successLog(`Version: ${require('../package.json').version}`),
      indexes: {
        sync: {
          all: async () => this.ldposAction('syncAllKeyIndexes', 'sync all update results:'),
          forging: async () => this.ldposAction('syncKeyIndex', 'sync forging update results:', 'forging'),
          multisig: async () => this.ldposAction('syncKeyIndex', 'sync multisig update results:', 'multisig'),
          sig: async () => this.ldposAction('syncKeyIndex', 'sync sig update results:', 'sig'),
        },
        verify: {
          forging: async () => this.ldposAction('verifyKeyIndex', 'verify forging results:', 'forging'),
          multisig: async () => this.ldposAction('verifyKeyIndex', 'verify multisig results:', 'multisig'),
          sig: async () => this.ldposAction('verifyKeyIndex', 'verify sig results:', 'sig'),
        },
        load: {
          forging: async () => this.ldposAction('loadKeyIndex', 'verify forging results:', 'forging'),
          multisig: async () => this.ldposAction('loadKeyIndex', 'verify multisig results:', 'multisig'),
          sig: async () => this.ldposAction('loadKeyIndex', 'verify sig results:', 'sig'),
        },
        save: {
          forging: async () => this.ldposAction('loadKeyIndex', 'verify forging results:', 'forging'),
          multisig: async () => this.ldposAction('loadKeyIndex', 'verify multisig results:', 'multisig'),
          sig: async () => this.ldposAction('loadKeyIndex', 'verify sig results:', 'sig'),
        },
      },
      wallet: {
        generate: async () => this.ldposAction('generate', 'generated wallet:'),
        get: async () => await this.actions.getWallet(),
      },
      config: {
        clean: async () => await fs.remove(this.fullConfigPath),
        networkSymbol: async () => this.ldposAction('getNetworkSymbol', 'sync all update results:'),
      },
      transaction: {
        transfer: async () => await this.actions.transfer(),
        vote: async () => await this.actions.vote(),
        unvote: async () => await this.actions.unvote(),
        multisignTransfer: async () => await this.actions.multisignTransfer(),
        verify: async () => await this.actions.verifyTransactionId(),
        registerMultisigWallet: async () => await this.actions.registerMultisigWallet(),
        registerMultisigDetails: async () => await this.actions.registerMultisigDetails(),
        registerSigDetails: async () => await this.actions.registerSigDetails(),
        registerForgingDetails: async () => await this.actions.registerForgingDetails(),
      },
      account: {
        balance: async () => await this.actions.balance(),
        transactions: async () => await this.actions.transactions(),
        votes: async () => await this.actions.votes(),
        block: async () => await this.actions.block(),
        list: async () => await this.actions.list(),
        pendingTransactions: async () => await this.actions.pendingTransactions(),
      },

      // Dev TESTS
      tests: {
        updateResult: async () => {
          let result = await this.client.syncAllKeyIndexes();
          console.log(result);
          result = await this.client.syncKeyIndex('forging');
          console.log(result);
        },
        deep: {
          nesting: {
            works: () => console.log('lets see'),
          },
        },
      },
      testCamel: () => console.log('working kebab to camel'),
      default: () => {},
    };
  }

  async interactive() {
    const cmd = await this.promptInput('cmd >');
    await this.execCmd(cmd);
  }

  async execCmd(cmd) {
    if (cmd === '' && this.config.interactive) {
      this.interactive();
      return;
    }

    if (cmd.includes(' ')) cmd = cmd.split(' ');

    try {
      const commands = [].concat(cmd);
      let accumulator = this.commands;

      for (let i = 0; i < commands.length; i++) {
        const currentValue = kebabCaseToCamel(commands[i]);

        if (accumulator[currentValue] !== undefined) {
          accumulator = accumulator[currentValue];
          if (typeof accumulator === 'function') await accumulator();
        } else if (typeof accumulator[currentValue] === 'function')
          await accumulator[currentValue]();
        else throw new Error('command invalid');
      }
    } catch (e) {
      debugger;
      this.invalidCommand(true);
    }

    if (this.config.interactive) this.interactive();
  }

  async command(argv) {
    // Switch case for commands
    try {
      let cmd = argv._[1];

      // check args eg. -v and --help, execute if exists in this.commands
      if (!cmd) {
        // 1 because first entry always is _
        for (let i = 1; i < Object.keys(argv).length; i++) {
          const arg = Object.keys(argv)[i];
          if (this.commands.hasOwnProperty(arg)) {
            this.commands[arg]();
            return;
          } else {
            this.invalidCommand();
          }
        }
      }

      // If command has ip split it
      if (
        argv._[0] &&
        argv._[0].includes('.') &&
        argv._[0].split('.').length === 4
      ) {
        argv._ = argv._.slice(1);
      }

      // Execute given command

      await this.execCmd(
        argv._.filter((el) => !(el.split('.').length === 5 && el.includes('.')))
      );
      this.exit();
    } catch (e) {
      debugger;
      errorLog(e.message);
    }
  }

  successLog(successMsg, prefix = '') {
    successMsg =
      typeof successMsg === 'object'
        ? JSON.stringify(successMsg, null, 2)
        : successMsg;
    prefix = typeof prefix === 'string' ? prefix.toUpperCase() : '';

    console.log(
      `\x1b[1m\x1b[32m${prefix}${
        prefix && prefix.length && '\n'
      }${successMsg}\x1b[0m`
    );
    this.exit(0);
  }

  errorLog(errorMsg) {
    console.log(`\x1b[1m\x1b[31mError: ${errorMsg}\x1b[0m`);
    console.log(
      '\x1b[1m\x1b[31m\nIf that didnt help you, please post an issue in the repo: \nhttps://github.com/Leasehold/ldpos-commander\x1b[0m'
    );

    this.exit(1);
  }

  invalidCommand() {
    this.errorLog(
      this.config.interactive
        ? 'Type help to see all available commands.'
        : 'Command is not found. Run ldpos --help to see all available commands.'
    );
  }

  // prettier-ignore
  intertactiveLog() {
    console.log('Commands:');
    console.log('  exit                                           Exits the process');
    console.log('  help                                           Shows this');
    console.log('  version                                        Shows CLI version');
    console.log('  indexes sync all                               Syncs all key indexes');
    console.log('  indexes sync forging                           Syncs forging key indexes');
    console.log('  indexes sync multisig                          Syncs multisig key indexes');
    console.log('  indexes sync sig                               Syncs sig key indexes');
    console.log('  indexes verify forging                         Verifies forging key indexes');
    console.log('  indexes verify multisig                        Verifies multisig key indexes');
    console.log('  indexes verify sig                             Verifies sig key indexes');
    console.log('  indexes load forging                           Loads forging key indexes');
    console.log('  indexes load multisig                          Loads multisig key indexes');
    console.log('  indexes load sig                               Loads sig key indexes');
    console.log('  indexes save forging                           Saves forging key indexes');
    console.log('  indexes save multisig                          Saves multisig key indexes');
    console.log('  indexes save sig                               Saves sig key indexes');
    console.log('  wallet generate                                Generates a wallet');
    console.log('  wallet get                                     Get wallet');
    console.log('  config clean                                   Removes config file with server ip, port and networkSymbol');
    console.log('  config network-symbol                          Gets current networkSymbol');
    console.log('  transaction transfer                           Transfer to a wallet');
    console.log('  transaction vote                               Vote a delegate');
    console.log('  transaction unvote                             Unvote a delegate');
    console.log('  transaction verify                             Verifies a transaction');
    console.log('  transaction register-multisig-wallet           Register a multisigwallet');
    console.log('  transaction register-multisig-details          Register a registerMultisigDetails');
    console.log('  transaction register-sig-details               Register a registerSigDetails');
    console.log('  transaction register-forging-details           Register a registerForgingDetails');
    console.log('  account balance                                Check your balance');
    console.log('  account public-keys                            Check your public keys');
    console.log('  account transactions                           Check your accounts transactions');
    console.log('  account votes                                  Check your accounts votes');
    console.log('  account block                                  Check your block');
    console.log('  account list                                   List your accounts');
    console.log('  account pending-transactions                   List pending transactions');
    // console.log('  account public-keys                            Check your public keys');
    console.log('');
  }

  // prettier-ignore
  commandLog() {
    console.log('Usage: ldpos                                     To use the command line interactively');
    console.log('');
    console.log('');
    console.log('Usage: ldpos (OPTIONAL: ip:port) [options] [command]\n');
    console.log('<ip:port>: Default port is 7001. If not provided it will prompt you in the steps.')
    console.log('Options:');
    console.log('  -v                                             Get the version of the current LDPoS installation');
    console.log('  --help                                         Get info on how to use this command');
    console.log('  --hostname                                     hostname');
    console.log('  --port                                         port');
    console.log("  --network-symbol                               Network symbol (default: 'ldpos')");
    console.log();
    console.log('Commands:');
    console.log('  indexes:');
    console.log('     sync:');
    console.log('         all                                     Syncs all key indexes');
    console.log('         forging                                 Syncs forging key indexes');
    console.log('         multisig                                Syncs multisig key indexes');
    console.log('         sig                                     Syncs sig key indexes');
    console.log('     verify:');
    console.log('         forging                                 Verifies forging key indexes');
    console.log('         multisig                                Verifies multisig key indexes');
    console.log('         sig                                     Verifies sig key indexes');
    console.log('     load:');
    console.log('         forging                                 Loads forging key indexes');
    console.log('         multisig                                Loads multisig key indexes');
    console.log('         sig                                     Loads sig key indexes');
    console.log('     save:');
    console.log('         forging                                 Saves forging key indexes');
    console.log('         multisig                                Saves multisig key indexes');
    console.log('         sig                                     Saves sig key indexes');
    console.log('  wallet:                                        Commands for wallets');
    console.log('     generate                                    Generates a wallet');
    console.log('     get                                         Get wallet');
    console.log('  config:                                        Commands for config');
    console.log('     network-symbol                              Gets current networkSymbol');
    console.log('     clean                                       Removes config file with server ip, port and networkSymbol');
    console.log('  transactions:                                  Commands for transactions');
    console.log('     transfer                                    Transfer to a wallet');
    console.log('     vote                                        Vote a a delegate');
    console.log('     unvote                                      Unvote a a delegate');
    console.log('     register-multisig-wallet                    Register a multisigwallet');
    console.log('     register-multisig-details                   Register a registerMultisigDetails');
    console.log('     register-sig-details                        Register a registerSigDetails');
    console.log('     register-forging-details                    Register a registerForgingDetails');
    console.log('  account:                                       Commands for your account');
    console.log('     balance                                     Check your balance');
    console.log('     public-keys                                 Check your public keys');
    console.log('     balance                                     Check your balance');
    console.log('     public-keys                                 Check your public keys');
    console.log('     transactions                                Check your accounts transactions');
    console.log('     votes                                       Check your accounts votes');
    console.log('     block                                       Check your block');
    console.log('     list                                        List your accounts');
    console.log('     pending-transactions                        List pending transactions');
    console.log('');
    this.exit(0, true)
  }

  exec = () => util.promisify(childProcess.exec);
  spawn = () => util.promisify(childProcess.spawn);
  fork = () => util.promisify(childProcess.fork);

  exit = async (code = 0, override = false) => {
    if (!this.config.interactive || override) process.exit(code);
  };

  /**
   * Prompt wrapper function
   * @param {string} message Prompt message
   * @param {boolean} secret When true input is hidden
   */
  promptInput = async (message, secret) => {
    const answer = await prompt([
      {
        type: secret ? 'password' : 'input',
        message,
        name: 'result',
        default: null,
        prefix: '',
      },
    ]);
    return answer.result;
  };

  ldposAction = async (fn, message, action = null) =>
    this.successLog(await this.client[fn](action), message);
}

const kebabCaseToCamel = (str) => str.replace(/-./g, (x) => x.toUpperCase()[1]);

module.exports = {
  CmdInterface,
  kebabCaseToCamel,
};

const fs = require('fs-extra');
const childProcess = require('child_process');
const inquirer = require('inquirer');
const prompt = inquirer.createPromptModule();
const util = require('util');
const ldposClient = require('ldpos-client');

class CmdInterface {
  constructor(config = {}) {
    this.config = {
      ...config,
      port: config.port ? config.port : 7001,
      networkSymbol: config.networkSymbol ? config.networkSymbol : 'ldpos',
    };

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
  }

  async init(config, clean) {
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
      this.passphrase =
        (await this.promptInput('Passphrase:', true)) ||
        'clerk aware give dog reopen peasant duty cheese tobacco trouble gold angle';
      this.client = ldposClient.createClient(config);

      try {
        await this.client.connect({
          passphrase: this.passphrase,
        });
      } catch (e) {
        this.errorLog("Can't connect to socket");
      }
    }

    return Promise.resolve(new CmdInterface(config));
  }

  getCommands() {
    return {
      login: () => console.log('login'),
      exit: () => process.exit(),
      config: {
        clean: async () => await fs.remove(this.fullConfigPath),
      },
      transaction: {
        transfer: async () => await this.actions.transfer(this),
        vote: async () => await this.actions.vote(this),
        unvote: async () => await this.actions.unvote(this),
      },
      account: {
        balance: async () => await this.actions.balance(this),
        transactions: async () => await this.actions.transactions(this),
      },
      help: async () =>
        this.config.interactive ? this.intertactiveLog() : this.commandLog(),
      v: async () =>
        successLog(`Version: ${require('../package.json').version}`),
      tests: {
        updateResult: async () => {
          console.log('hit');
          let result = await this.client.syncAllKeyIndexes();
          this.successLog(result);
          result = await this.client.syncKeyIndex('forging');
          this.successLog(result);
          console.log('hit end');
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
      const commands = [].concat(cmd)
      let accumulator = this.commands

      for (let i = 0; i < commands.length; i++) {
        const currentValue = kebabCaseToCamel(commands[i]);

        if(accumulator[currentValue] !== undefined) {
          accumulator = accumulator[currentValue]
          if(typeof accumulator === 'function') await accumulator()
        }
        else if(typeof accumulator[currentValue] === 'function') await accumulator[currentValue]()
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

      // If command is an ip execute it on another server
      if (cmd && cmd.includes('.') && cmd.split('.').length === 4) {
        const hostname = cmd.split(':')[0];
        const port = cmd.split(':')[1] || 7001;
        const networkSymbol = await networkSymbolPrompt();
        cmd = argv._[2];
        category = argv._[1];

        this.config = { networkSymbol, hostname, port };
      }

      // Execute given command

      this.execCmd(
        argv._.filter((el) => !(el.split('.').length === 5 && el.includes('.')))
      );
      process.exit();
    } catch (e) {
      debugger;
      errorLog(e.message);
    }
  }

  successLog(successMsg) {
    console.log(`\x1b[1m\x1b[32m${successMsg}\x1b[0m`);
    process.exit();
  }

  errorLog(errorMsg, interactive = false) {
    console.log(`\x1b[1m\x1b[31mError: ${errorMsg}\x1b[0m`);
    console.log(
      '\x1b[1m\x1b[31m\nIf that didnt help you, please post an issue in the repo: \nhttps://github.com/Leasehold/ldpos-commander\x1b[0m'
    );

    if (!interactive) process.exit(1);
  }

  invalidCommand(interactive = false) {
    this.errorLog(
      interactive
        ? 'Type help to see all available commands.'
        : 'Command is not found. Run ldpos --help to see all available commands.',
      interactive
    );
  }

  // prettier-ignore
  intertactiveLog() {
    console.log('Commands:');
    console.log('  config clean                                   Removes config file with server ip, port and networkSymbol');
    console.log('  transaction transfer                           Transfer to a wallet');
    console.log('  transaction vote                               Vote a a delegate');
    console.log('  transaction unvote                             Unvote a a delegate');
    console.log('  transaction register-multi-wallet              Register a multisigwallet');
    console.log('  transaction register-sig-details               Register a registerSigDetails');
    console.log('  transaction register-multi-details             Register a registerMultisigDetails');
    console.log('  transaction register-forging-details           Register a registerForgingDetails');
    console.log('  account balance                                Check your balance');
    console.log('  account public-keys                            Check your public keys');
    console.log('');
  }

  // prettier-ignore
  commandLog() {
    console.log('Usage: ldpos                     To use the command line interactively');
    console.log('');
    console.log('');
    console.log('Usage: ldpos (OPTIONAL: ip:port) [options] [command]\n');
    console.log('<ip:port>: Default port is 7001. If not provided it will prompt you in the steps.')
    console.log('Options:');
    console.log('  -v                             Get the version of the current LDPoS installation');
    console.log('  --help                         Get info on how to use this command');
    console.log('  --hostname                     hostname');
    console.log('  --port                         port');
    console.log("  --network-symbol               Network symbol (default: 'ldpos'");
    console.log();
    console.log('Commands:');
    console.log('  config:                        Commands for config');
    console.log('     clean                       Removes config file with server ip, port and networkSymbol');
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
  }

  exec = () => util.promisify(childProcess.exec);
  spawn = () => util.promisify(childProcess.spawn);
  fork = () => util.promisify(childProcess.fork);

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
}

const kebabCaseToCamel = (str) => str.replace(/-./g, (x) => x.toUpperCase()[1]);

module.exports = {
  CmdInterface,
  kebabCaseToCamel,
};

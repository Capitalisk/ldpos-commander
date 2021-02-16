#!/usr/bin/env node

const { CliInterface } = require('@maartennnn/cli-builder');
const actions = require('../lib/actions');

const beforeCommandFn = async () => {
  // TODO: Implement ip:port
  // TODO: Clean to exceptions
  // TODO: If no hostname or port prompt them
  // TODO: If network symbol not define prompt it
  // TODO: Save config file
  // TODO: Prompt pass phrase
  // TODO: LDPoS client connect
  const clean = argv._.includes('clean');

  actions = require('./actions');

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
};

const options = {
  interactive: true,
  helpFooter: '',
  helpHeader: 'This is shown in the header',
  // beforeCommandFn,
};

const ldposAction = async (fn, message, action = null) =>
  this.successLog(
    typeof this.client[fn] === 'function'
      ? await this.client[fn](action)
      : this.client[fn],
    message
  );

const cli = new CliInterface();

// prettier-ignore
const commands = {
  login: () => console.log('login'),
  exit: () => cli.exit(),
  v: async () => successLog(`Version: ${require('../package.json').version}`),
  version: async () => successLog(`Version: ${require('../package.json').version}`),
  indexes: {
    sync: {
      all: {
        execute: async () => ldposAction('syncAllKeyIndexes', 'sync all update results:'),
        help: 'test'
      },
      forging: {
        execute: async () => ldposAction('syncKeyIndex', 'sync forging update results:', 'forging'),
        help: 'test'
      },
      multisig: {
        execute: async () => ldposAction('syncKeyIndex', 'sync multisig update results:', 'multisig'),
        help: 'test'
      },
      sig: {
        execute: async () => ldposAction('syncKeyIndex', 'sync sig update results:', 'sig'),
        help: 'test'
      },
    },
    verify: {
      forging: {
        execute: async () => ldposAction('verifyKeyIndex', 'verify forging results:', 'forging'),
        help: 'test'
      },
      multisig: {
        execute: async () => ldposAction('verifyKeyIndex', 'verify multisig results:', 'multisig'),
        help: 'test'
      },
      sig: {
        execute: async () => ldposAction('verifyKeyIndex', 'verify sig results:', 'sig'),
        help: 'test'
      },
    },
    load: {
      forging: {
        execute: async () => ldposAction('loadKeyIndex', 'verify forging results:', 'forging'),
        help: 'test'
      },
      multisig: {
        execute: async () => ldposAction('loadKeyIndex', 'verify multisig results:', 'multisig'),
        help: 'test'
      },
      sig: {
        execute: async () => ldposAction('loadKeyIndex', 'verify sig results:', 'sig'),
        help: 'test'
      },
    },
    save: {
      forging: {
        execute: async () => ldposAction('loadKeyIndex', 'verify forging results:', 'forging'),
        help: 'test'
      },
      multisig: {
        execute: async () => ldposAction('loadKeyIndex', 'verify multisig results:', 'multisig'),
        help: 'test'
      },
      sig: {
        execute: async () => ldposAction('loadKeyIndex', 'verify sig results:', 'sig'),
        help: 'test'
      },
    },
  },
  wallet: {
    balance: {
      execute: async () => await actions.getBalance(),
      help: 'test'
    },
    address: {
      execute: async () => ldposAction('getWalletAddress', 'wallet address:'),
      help: 'test'
    },
    generate: {
      execute: async () => ldposAction('generateWallet', 'generated wallet:'),
      help: 'test'
    },
    get: {
      execute: async () => await actions.getWallet(),
      help: 'test'
    },
    getMultisigWalletMembers: {
      execute: async () => await actions.getMultisigWalletMembers(),
      help: 'test'
    },
    publicKey: {
      execute: async () => ldposAction('sigPublicKey', 'public key:'),
      help: 'test'
    },
    multisigPublicKey: {
      execute: async () => ldposAction('multisigPublicKey', 'public key:'),
      help: 'test'
    },
  },
  config: {
    clean: {
      execute: async () => await fs.remove(cli.fullConfigPath),
      help: 'test'
    },
    networkSymbol: {
      execute: async () => ldposAction('getNetworkSymbol', 'sync all update results:'),
      help: 'test'
    },
  },
  transaction: {
    transfer: {
      execute: async () => await actions.transfer(),
      help: 'test'
    },
    vote: {
      execute: async () => await actions.vote(),
      help: 'test'
    },
    unvote: {
      execute: async () => await actions.unvote(),
      help: 'test'
    },
    multisignTransfer: {
      execute: async () => await actions.multisignTransfer(),
      help: 'test'
    },
    verify: {
      execute: async () => await actions.verifyTransaction(),
      help: 'test'
    },
    registerMultisigWallet: {
      execute: async () => await actions.registerMultisigWallet(),
      help: 'test'
    },
    registerMultisigDetails: {
      execute: async () => await actions.registerMultisigDetails(),
      help: 'test'
    },
    registerSigDetails: {
      execute: async () => await actions.registerSigDetails(),
      help: 'test'
    },
    registerForgingDetails: {
      execute: async () => await actions.registerForgingDetails(),
      help: 'test'
    },
  },
  account: {
    balance: {
      execute: async () => await actions.balance(),
      help: 'test'
    },
    transactions: {
      execute: async () => await actions.transactions(),
      help: 'test'
    },
    votes: {
      execute: async () => await actions.votes(),
      help: 'test'
    },
    block: {
      execute: async () => await actions.block(),
      help: 'test'
    },
    list: {
      execute: async () => await actions.list(),
      help: 'test'
    },
    pendingTransactions: {
      execute: async () => await actions.pendingTransactions(),
      help: 'test'
    },
  }
}

cli.run(commands, options);

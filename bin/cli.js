#!/usr/bin/env node

const fs = require('fs-extra');
const ldposClient = require('ldpos-client');
const { CliInterface } = require('@maartennnn/cli-builder');
const actions = require('../lib/actions');
const { FULL_CONFIG_PATH } = require('../lib/constants');

const cli = new CliInterface({
  interactive: true,
  helpFooter: '',
  helpHeader: 'This is shown in the header',
  exceptions: ['clean'],
  actions,
});

(async () => {
  // TODO: Implement ip:port
  // TODO: Clean to exceptions
  // TODO: If no hostname or port prompt them
  // TODO: If network symbol not define prompt it
  // TODO: Save config file
  // TODO: Prompt pass phrase
  // TODO: LDPoS client connect
  let config = {};
  let client;

  // If command is an ip change config to that IP
  if (
    cli.argv._[0] &&
    cli.argv._[0].includes('.') &&
    cli.argv._[0].split('.').length === 4
  ) {
    const hostname = cli.argv._[0].split(':')[0];
    const port = cli.argv._[0].split(':')[1] || 7001;

    config = { hostname, port };
  }

  if (
    !cli.options.exceptions
      .map((f) => cli.argv.hasOwnProperty(f))
      .includes(true)
  ) {
    if (!cli.options.hostname) {
      if (await fs.pathExists(FULL_CONFIG_PATH)) {
        config = require(FULL_CONFIG_PATH);
      } else {
        // prettier-ignore
        config = {
          ...config,
          hostname: await cli.promptInput('Server IP:') || '34.227.22.98',
          port: await cli.promptInput('Port: (Default: 7001)') || 7001,
        };

        const save = ['Y', 'y'].includes(
          await cli.promptInput(`Save in your home dir? (Y/n)`)
        );

        if (save)
          await fs.outputFile(
            FULL_CONFIG_PATH,
            JSON.stringify(config, null, 2)
          );
      }
    }

    if (!config.networkSymbol) {
      config = {
        ...config,
        networkSymbol:
          (await cli.promptInput('Network symbol: (Default: ldpos)')) ||
          'ldpos',
      };
    }

    // Get passphrase of the wallet
    config.passphrase =
      (await cli.promptInput('Passphrase:', true)) ||
      'clerk aware give dog reopen peasant duty cheese tobacco trouble gold angle';
    client = ldposClient.createClient(config);

    try {
      await client.connect({
        passphrase: this.passphrase,
      });

      cli.options.bindActionArgs = [client];
    } catch (e) {
      cli.errorLog("Can't connect to socket");
    }
  }

  const ldposAction = async (fn, message, action = null) =>
    cli.successLog(
      typeof client[fn] === 'function' ? await client[fn](action) : client[fn],
      message
    );

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
        execute: async () => await cli.actions.getBalance(),
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
        execute: async () => await cli.actions.getWallet(),
        help: 'test'
      },
      getMultisigWalletMembers: {
        execute: async () => await cli.actions.getMultisigWalletMembers(),
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
        execute: async () => await cli.actions.transfer(),
        help: 'test'
      },
      vote: {
        execute: async () => await cli.actions.vote(),
        help: 'test'
      },
      unvote: {
        execute: async () => await cli.actions.unvote(),
        help: 'test'
      },
      multisignTransfer: {
        execute: async () => await cli.actions.multisignTransfer(),
        help: 'test'
      },
      verify: {
        execute: async () => await cli.actions.verifyTransaction(),
        help: 'test'
      },
      registerMultisigWallet: {
        execute: async () => await cli.actions.registerMultisigWallet(),
        help: 'test'
      },
      registerMultisigDetails: {
        execute: async () => await cli.actions.registerMultisigDetails(),
        help: 'test'
      },
      registerSigDetails: {
        execute: async () => await cli.actions.registerSigDetails(),
        help: 'test'
      },
      registerForgingDetails: {
        execute: async () => await cli.actions.registerForgingDetails(),
        help: 'test'
      },
    },
    account: {
      balance: {
        execute: async () => await cli.actions.balance(),
        help: 'test'
      },
      transactions: {
        execute: async () => await cli.actions.transactions(),
        help: 'test'
      },
      votes: {
        execute: async () => await cli.actions.votes(),
        help: 'test'
      },
      block: {
        execute: async () => await cli.actions.block(),
        help: 'test'
      },
      list: {
        execute: async () => await cli.actions.list(),
        help: 'test'
      },
      pendingTransactions: {
        execute: async () => await cli.actions.pendingTransactions(),
        help: 'test'
      },
    }
  }

  cli.run(commands);
})();

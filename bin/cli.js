#!/usr/bin/env node

const fs = require('fs-extra');
const ldposClient = require('ldpos-client');
const { REPLClient } = require('@maartennnn/cli-builder');
const actions = require('../lib/actions');
const { FULL_CONFIG_PATH } = require('../lib/constants');

const NETWORK_SYMBOLS = ['clsk'];

const cli = new REPLClient({
  interactive: true,
  helpFooter: 'CLI of Leasehold',
  helpHeader:
    'This interface can be used both interactively and non-interactively\nInteractively: ldpos\nNon-interactively: ldpos <OPTIONAL: ip or ip:port> <command>',
  exceptions: ['clean'],
  actions,
});

(async () => {
  let config = {
    chainModuleName: 'capitalisk_chain',
    networkSymbol: 'clsk',
  };
  let client;

  // If command is an ip change config to that IP
  if (
    cli.argv._[0] &&
    cli.argv._[0].includes('.') &&
    cli.argv._[0].split('.').length === 4
  ) {
    const hostname = cli.argv._[0].split(':')[0];
    const port = cli.argv._[0].split(':')[1] || 7001;

    // Take out the IP if provided
    cli.argv._ = cli.argv._.slice(1);

    config = { ...config, hostname, port };
  }

  if (
    !cli.options.exceptions
      .map((f) => cli.argv.hasOwnProperty(f) || cli.argv._.includes(f))
      .includes(true)
  ) {
    if (!config.hostname) {
      if (await fs.pathExists(FULL_CONFIG_PATH)) {
        config = { ...config, ...require(FULL_CONFIG_PATH) };
      } else {
        // prettier-ignore
        config = {
          ...config,
          hostname: await cli.promptInput('Server IP:'),
          port: await cli.promptInput('Port: (Default: 7001)') || 7001,
        };

        if (config.hostname === '')
          return cli.errorLog('Hostname needs to be provided');

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

    // if (!config.networkSymbol) {
    //   config.networkSymbol = await cli.promptList(
    //     'Network symbol: (Default: clsk)',
    //     NETWORK_SYMBOLS,
    //     NETWORK_SYMBOLS[0]
    //   );
    // }

    // Get passphrase of the wallet
    config.passphrase = await cli.promptInput('Passphrase:', true);

    if (config.hostname === '')
      return cli.errorLog('Passphrase needs to be provided');

    client = ldposClient.createClient(config);

    cli.options.bindActionArgs = [client];
    try {
      await client.connect({
        passphrase: config.passphrase,
      });

      await client.syncAllKeyIndexes();
      console.log('All key indexes synced.');
    } catch (e) {
      cli.errorLog(
        "Can't connect to socket\nThis can be because of a bad passphrase"
      );
    }
  }

  const ldposAction = async (clientKey, message, arg = null) => {
    cli.successLog(
      typeof client[clientKey] === 'function'
        ? await client[clientKey](arg)
        : client[clientKey],
      message
    );
  };

  // prettier-ignore
  const commands = {
    exit: {
      execute: () => cli.exit(0, true),
      help: 'Exits the process'
    },
    v: async () => cli.successLog(`Version: ${require('../package.json').version}`),
    version: async () => cli.successLog(`Version: ${require('../package.json').version}`),
    wallet: {
      list: {
        transactions: {
          execute: async () => await cli.actions.transactions(),
          help: 'Check your transactions'
        },
        votes: {
          execute: async () => await cli.actions.votes(),
          help: 'Check your votes'
        },
      },
      get: {
        balance: {
          execute: async () => await cli.actions.balance(),
          help: 'Check your balance'
        },
        publicKey: {
          execute: async () => ldposAction('sigPublicKey', 'public key:'),
          help: 'Check your public key'
        },
        multisigPublicKey: {
          execute: async () => ldposAction('multisigPublicKey', 'public key:'),
          help: 'Get multisig wallet public key'
        },
      },
    },
    config: {
      clean: {
        execute: async () => await fs.remove(cli.fullConfigPath),
        help: 'Removes config file with server ip, port and networkSymbol'
      },
      networkSymbol: {
        current: {
          execute: async () => ldposAction('getNetworkSymbol', 'Network symbol:'),
          help: 'Gets current networkSymbol'
        },
        change: {
          execute: async () => {
            const networkSymbol = await cli.promptList('Choose network symbol: (Default: clsk)', NETWORK_SYMBOLS, NETWORK_SYMBOLS[0])
            config.networkSymbol = networkSymbol
            client = ldposClient.createClient(config);
          },
          help: 'Change the protocol'
        }
      },
    },
    transaction: {
      post: {
        transfer: {
          execute: async () => await cli.actions.transfer(),
          help: 'Transfer to a wallet'
        },
        vote: {
          execute: async () => await cli.actions.vote(),
          help: 'Vote a delegate'
        },
        unvote: {
          execute: async () => await cli.actions.unvote(),
          help: 'Unvote a delegate'
        },
        multisigTransfer: {
          execute: async () => await cli.actions.multisigTransfer(),
          help: 'Transfers to a multisig wallet'
        },
      },
      count: {
        pending: {
          execute: async () => await cli.actions.pendingTransactions(),
          help: 'List pending transactions'
        },
      },
      // verify: {
      //   execute: async () => await cli.actions.verifyTransaction(),
      //   help: 'Verifies a transaction'
      // },
      register : {
        multisigWallet: {
          execute: async () => await cli.actions.registerMultisigWallet(),
          help: 'Register a multisigwallet'
        },
        multisigDetails: {
          execute: async () => await cli.actions.registerMultisigDetails(),
          help: 'Register a registerMultisigDetails'
        },
        sigDetails: {
          execute: async () => await cli.actions.registerSigDetails(),
          help: 'Register a registerSigDetails'
        },
        forgingDetails: {
          execute: async () => await cli.actions.registerForgingDetails(),
          help: 'Register a registerForgingDetails'
        },
      }
    },
    account: {
      list: {
        byBalance: {
          execute: async () => await cli.actions.listAccountsByBalance(),
          help: 'List accounts'
        },
        multisigWalletMembers: {
          execute: async () => await cli.actions.listMultisigWalletMembers(),
          help: 'Get wallet members'
        },
      },
      get: {
        balance: {
          execute: async () => await cli.actions.getBalance(),
          help: 'Get balance of prompted wallet'
        },
        wallet: {
          execute: async () => await cli.actions.getWallet(),
          help: 'Get wallet'
        },
        address: {
          execute: async () => ldposAction('getWalletAddress', 'wallet address:'),
          help: 'Get address of signed in wallet'
        },
        publicKey: {
          execute: async () => ldposAction('sigPublicKey', 'public key:'),
          help: 'Get sig wallet public key'
        },
      },
      generate: {
        execute: async () => ldposAction('generateWallet', 'generated wallet:'),
        help: 'Generates a new wallet'
      },
    },
    delegate: {
      list :{
        forgingDelegates: {
          execute: async () => await cli.actions.listForgingDelegates(),
          help: 'List forging deletes'
        },
        byWeight: {
          execute: async () => await cli.actions.listDelegatesByVoteWeight(),
          help: 'Delegates by weight in votes'
        }
      }
    },
  }

  await cli.run(commands);
})();

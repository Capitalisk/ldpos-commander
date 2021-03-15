#!/usr/bin/env node

const fs = require('fs-extra');
const ldposClient = require('ldpos-client');
const { REPLClient } = require('@maartennnn/cli-builder');
const actions = require('../lib/actions');
const { FULL_CONFIG_PATH, SIGNATURE_PATH } = require('../lib/constants');
const { _integerToDecimal } = require('../lib/utils');

const NETWORK_SYMBOLS = ['clsk'];

const cli = new REPLClient({
  interactive: true,
  helpFooter: 'LDPoS Commander',
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
    config.passphrases = {
      passphrase: await cli.promptInput('Passphrase:', true),
    };

    if (cli.argv.hasOwnProperty('f')) {
      config.passphrases = {
        ...config.passphrases,
        forgingPassphrase: await cli.promptInput('Forging passphrase:', true),
      };
      delete cli.argv.f;
    }

    if (cli.argv.hasOwnProperty('m')) {
      config.passphrases = {
        ...config.passphrases,
        multisigPassphrase: await cli.promptInput('Multisig passphrase:', true),
      };
      delete cli.argv.m;
    }

    if (config.hostname === '')
      return cli.errorLog('Hostname needs to be provided');

    client = ldposClient.createClient(config);

    cli.options.bindActionArgs = [client];
    try {
      await client.connect({
        ...config.passphrases,
      });
    } catch (e) {
      cli.errorLog(
        "Can't connect to socket\nThis can be because of a bad passphrase"
      );
    }

    try {
      await client.syncAllKeyIndexes();
      console.log('All key indexes synced.');
    } catch (e) {
      cli.errorLog(`Failed to syncAllKeyIndexes: ${e.message}`);
    }
  }

  const customProperty = async function (param, address) {
    param = this.kebabCaseToCamel(param);

    const data = await client.getAccount(address);

    if (data[param] === undefined)
      throw new Error('Custom property not found.');

    let output;

    if (!Number.isInteger(parseInt(data[param]))) output = data[param];
    else output = _integerToDecimal(data[param]);

    this.successLog(output, `${this.camelCaseToKebab(param)}:`);
  };

  const ldposAction = async (clientKey, message, arg = null) => {
    cli.successLog(
      typeof client[clientKey] === 'function'
        ? await client[clientKey](arg)
        : client[clientKey],
      message
    );
  };

  const commands = {
    exit: {
      execute: () => cli.exit(0, true),
      help: 'Exits the process',
    },
    v: async () =>
      cli.successLog(`Version: ${require('../package.json').version}`),
    version: async () =>
      cli.successLog(`Version: ${require('../package.json').version}`),
    wallet: {
      list: {
        transactions: {
          execute: async () => await cli.actions.transactions(),
          help: 'Check your transactions',
        },
        votes: {
          execute: async () => await cli.actions.votes(),
          help: 'Check your votes',
        },
      },
      get: {
        balance: {
          help: 'Check your balance',
        },
        sigPublicKey: {
          help: 'Check your public key',
        },
        forgingPublicKey: {
          help: 'Check your forging public key',
        },
        multisigPublicKey: {
          help: 'Check your multisig public key',
        },
        address: {
          help: 'Get address of signed in wallet',
        },
        '<custom-property>': {
          help: 'Get a custom property on the wallet',
        },
        execute: async function (param) {
          const address = await client.getWalletAddress();
          await customProperty.call(this, param, address);
        },
      },
    },
    config: {
      signatures: {
        clean: {
          execute: async () => {
            await fs.emptyDir(SIGNATURE_PATH);
            cli.successLog('Signatures cleaned.');
          },
          help: `Removes all signatures in the default path (${SIGNATURE_PATH})`,
        },
      },
      clean: {
        execute: async () => {
          await fs.remove(FULL_CONFIG_PATH);
          cli.successLog('Config file removed.');
        },
        help: 'Removes config file with server ip, port and networkSymbol',
      },
      networkSymbol: {
        current: {
          execute: async () =>
            ldposAction('getNetworkSymbol', 'Network symbol:'),
          help: 'Gets current networkSymbol',
        },
        change: {
          execute: async () => {
            const networkSymbol = await cli.promptList(
              'Choose network symbol: (Default: clsk)',
              NETWORK_SYMBOLS,
              NETWORK_SYMBOLS[0]
            );
            config.networkSymbol = networkSymbol;
            client = ldposClient.createClient(config);
          },
          help: 'Change the protocol',
        },
      },
    },
    transaction: {
      create: {
        multisigTransfer: {
          execute: async () => await cli.actions.createMultisigTransfer(),
          help: 'Transfers to a multisig wallet',
        },
      },
      sign: {
        multisigTransfer: {
          execute: async () => await cli.actions.signMultisigTransfer(),
          help: 'Transfers to a multisig wallet',
        },
      },
      post: {
        transfer: {
          execute: async () => await cli.actions.transfer(),
          help: 'Transfer to a wallet',
        },
        vote: {
          execute: async () => await cli.actions.vote(),
          help: 'Vote a delegate',
        },
        unvote: {
          execute: async () => await cli.actions.unvote(),
          help: 'Unvote a delegate',
        },
        multisigTransfer: {
          execute: async () => await cli.actions.postMultisigTransfer(),
          help: 'Transfers to a multisig wallet',
        },
        registerMultisigWallet: {
          execute: async () => await cli.actions.registerMultisigWallet(),
          help: 'Register a multisigwallet',
        },
        registerMultisigDetails: {
          execute: async () => await cli.actions.registerMultisigDetails(),
          help: 'Register a registerMultisigDetails',
        },
        registerSigDetails: {
          execute: async () => await cli.actions.registerSigDetails(),
          help: 'Register a registerSigDetails',
        },
        registerForgingDetails: {
          execute: async () => await cli.actions.registerForgingDetails(),
          help: 'Register a registerForgingDetails',
        },
      },
      count: {
        pending: {
          execute: async () => await cli.actions.pendingTransactions(),
          help: 'List pending transactions',
        },
      },
    },
    account: {
      list: {
        byBalance: {
          execute: async () => await cli.actions.listAccountsByBalance(),
          help: 'List accounts',
        },
        multisigWalletMembers: {
          execute: async () => await cli.actions.listMultisigWalletMembers(),
          help: 'Get wallet members',
        },
      },
      get: {
        balance: {
          help: 'Get balance of prompted wallet',
        },
        wallet: {
          help: 'Get wallet',
        },
        sigPublicKey: {
          help: 'Get a sig public key',
        },
        multisigPublicKey: {
          help: 'Get a multisig public key',
        },
        forgingPublicKey: {
          help: 'Get a multisig public key',
        },
        '<custom-property>': {
          help: 'Get a custom property on the wallet',
        },
        execute: async function (param) {
          const address = await this.promptInput('Wallet address:');
          await customProperty.call(this, param, address);
        },
      },
      generate: {
        execute: async () => ldposAction('generateWallet', 'generated wallet:'),
        help: 'Generates a new wallet',
      },
    },
    delegate: {
      list: {
        forgingDelegates: {
          execute: async () => await cli.actions.listForgingDelegates(),
          help: 'List forging deletes',
        },
        byVoteWeight: {
          execute: async () => await cli.actions.listDelegatesByVoteWeight(),
          help: 'Delegates by weight in votes',
        },
      },
    },
  };

  await cli.run(commands);
})();

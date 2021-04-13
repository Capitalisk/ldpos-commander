#!/usr/bin/env node

const fs = require('fs-extra');
const ldposClient = require('ldpos-client');
const { REPLClient } = require('@maartennnn/cli-builder');
const actions = require('../lib/actions');
const {
  FULL_CONFIG_PATH,
  CONFIG_PATH,
  FULL_DIRECTORY_CONFIG,
} = require('../lib/constants');
const {
  _checkDirectoryConfig,
  _storePassphrase,
  _saveConfig,
  _integerToDecimal,
} = require('../lib/utils');

const NETWORK_SYMBOLS = ['clsk'];

const cli = new REPLClient({
  interactive: true,
  helpFooter:
    '\n\x1b[1mLDPoS Commander created with CLI-Builder:\nhttps://github.com/maarteNNNN/cli-builder\x1b[0m',
  helpHeader: `This interface can be used both interactively and non-interactively:

Usage interactively: \x1b[1mldpos (OPTIONAL: -pmf)\x1b[0m

OR

Usage non-interactively: \x1b[1mldpos (OPTIONAL: -pmf) (OPTIONAL: ip or ip:port) [command]\x1b[0m
ip:port - Default port is 7001. If not provided it will prompt you in the steps.
eg.: ldpos 192.168.0.1 wallet get
eg.: ldpos 192.168.0.1:7003 wallet get

Options accepted both interactively and non-interactively:
  (option -p) PASSPHRASE
  (option -m) MULTISIGPASSPHRASE
  (option -f) FORGINPASSPHRASE
  `,
  exceptions: ['clean'],
  actions,
});

(async () => {
  let config = {
    chainModuleName: 'capitalisk_chain',
    networkSymbol: 'clsk',
    passphrases: {},
  };
  let client;

  const readOnly = !(
    cli.argv._.join(' ').match(/(create|sign|post)/gm) ||
    cli.argv._[0] === 'wallet'
  );

  // Create config path, this is used for signatures, ldpos-config.json and default path for multisig transactions
  try {
    await fs.mkdirp(CONFIG_PATH);
  } catch (e) {
    cli.errorLog('Failed to create config path', 1, true);
  }

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
        const configFile = require(FULL_CONFIG_PATH);

        // Decode passphrases
        if (configFile.passphrases) {
          for (let i = 0; i < Object.keys(configFile.passphrases).length; i++) {
            const type = Object.keys(configFile.passphrases)[i];
            const passphrase = configFile.passphrases[type];

            configFile.passphrases[type] = passphrase
              ? Buffer.from(passphrase, 'base64').toString()
              : null;
          }
        }

        config = { ...config, ...configFile };
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

        if (save) await _saveConfig(config);
      }
    }

    if (cli.argv.hasOwnProperty('p')) {
      config.passphrases.passphrase = await cli.promptInput(
        'Passphrase:',
        true
      );

      delete cli.argv.p;
    } else if (!config.passphrases.hasOwnProperty('passphrase') && !readOnly) {
      // Get passphrase of the wallet
      config.passphrases.passphrase = await cli.promptInput(
        'Passphrase:',
        true
      );

      await _storePassphrase(
        'passphrase',
        config,
        cli,
        config.passphrases.passphrase
      );
    } else if (!config.passphrases.passphrase && !readOnly)
      config.passphrases = {
        passphrase: await cli.promptInput('Passphrase: ', true),
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
        "Can't connect to node\nThis can be because of a bad passphrase",
        1,
        cli.options.interactive,
        !cli.options.interactive
      );
    }
    if (!readOnly) {
      try {
        await client.syncAllKeyIndexes();
        console.log('All key indexes synced.');
      } catch (e) {
        cli.errorLog(
          `Failed to syncAllKeyIndexes: ${e.message}`,
          1,
          false,
          true
        );
      }
    }

    if (cli.argv.hasOwnProperty('p')) delete cli.argv.p;
    if (cli.argv.hasOwnProperty('m')) delete cli.argv.m;
    if (cli.argv.hasOwnProperty('f')) delete cli.argv.f;
  }

  /**
   * Get a custom property or display the object returned
   * @param {any} arg Argument passed to the client's function
   * @param {string} fn Function name to call in the client object
   */
  const getObject = async function (arg, fn, title) {
    const data = await client[fn](arg);

    if (data.balance) data.balance = _integerToDecimal(data.balance);
    if (data.amount) data.amount = _integerToDecimal(data.amount);
    if (data.fee) data.fee = _integerToDecimal(data.fee);

    this.successLog(data, `${title}`);
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
    login: {
      help: 'Login with a passphrase. Intented for interactive mode only',
      execute: async () => {
        const passphrase = await cli.promptInput('Passphrase:', true);

        if (!passphrase) throw new Error('No passphrase provided.');

        try {
          await client.connect({
            passphrase,
          });
        } catch (e) {
          cli.errorLog(e.message);
        }
      },
    },
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
        outboundTransactions: {
          execute: async () => await cli.actions.outboundTransactions(),
          help: 'Check your outbound transactions',
        },
        inboundTransactions: {
          execute: async () => await cli.actions.outboundTransactions(),
          help: 'Check your outbound transactions',
        },
        pendingTransactions: {
          inbound: {
            execute: async () =>
              await cli.actions.listPendingOutboundTransactions(),
            help: 'Check your pending outbound transactions',
          },
          outbound: {
            execute: async () =>
              await cli.actions.listPendingInboundTransactions(),
            help: 'Check your pending inbound transactions',
          },
        },
        votes: {
          execute: async () => await cli.actions.votes(),
          help: 'Check your votes',
        },
      },
      get: {
        balance: {
          help: 'Get the balance of your wallet',
          execute: async () => {
            const address = await client.getWalletAddress();
            const { balance } = await client.getAccount(address);
            cli.successLog(_integerToDecimal(balance), 'balance');
          },
        },
        help: 'Check your account',
        execute: async function () {
          const address = await client.getWalletAddress();
          if (!address) throw new Error('No address provided');

          await getObject.call(this, address, 'getAccount', 'Wallet');
        },
      },
    },
    config: {
      clean: {
        passphrases: {
          execute: async () => {
            const config = require(FULL_CONFIG_PATH);
            delete config.passphrases;
            await _saveConfig(config);
          },
          help: 'Removes the passphrase',
        },
        signatures: {
          defaultPath: {
            execute: async () => {
              await fs.remove(FULL_DIRECTORY_CONFIG);
              cli.successLog('Default path removed.');
            },
            help:
              'Removes the default path (IMPORTANT: this action is irreversible)',
          },
          execute: async () => {
            const signaturePath = await _checkDirectoryConfig(true);
            await fs.emptyDir(signaturePath);
            cli.successLog(`Signatures cleaned in ${signaturePath}`);
          },
          help:
            'Removes all signatures in the default path (IMPORTANT: this action is irreversible)',
        },
        execute: async () => {
          await fs.remove(FULL_CONFIG_PATH);
          cli.successLog('Config file removed.');
        },
        help:
          'Removes config file with server ip, port and networkSymbol (IMPORTANT: this action is irreversible)',
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
      get: {
        help:
          'Get a transaction, accepts an id as argument. If not provided it prompts it.',
        execute: async function (id = null) {
          if (!id) id = await cli.promptInput('Transaction ID:');
          if (!id) throw new Error('No transaction id provided.');
          await getObject.call(this, id, 'getTransaction', 'Transaction');
        },
      },
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
        multisigTransaction: {
          execute: async () => await cli.actions.postMultisigTransaction(),
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
          help: 'Get the balance of an account',
          execute: async (address = null) => {
            if (!address) address = await cli.promptInput('Wallet address:');
            if (!address) throw new Error('No address provided.');
            const { balance } = await client.getAccount(address);
            cli.successLog(_integerToDecimal(balance), 'balance');
          },
        },
        help:
          'Get a account, accepts an address as argument if run non-interactively. If not provided it prompts it.',
        execute: async function (address = null) {
          if (!address) address = await cli.promptInput('Wallet address:');
          if (!address) throw new Error('No address provided.');
          await getObject.call(cli, address, 'getAccount', 'Account');
        },
      },
      generate: {
        execute: async () => ldposAction('generateWallet', 'generated wallet:'),
        help: 'Generates a new wallet',
      },
    },
    delegate: {
      get: {
        help:
          'Gets a delegate, accepts an address as argument if run non-interactively. If not provided it prompts it.',
        execute: async function (address = null) {
          if (!address) address = await this.promptInput('Wallet address:');
          if (!address) throw new Error('No address provided.');
          await getObject.call(this, address, 'getDelegate', 'Delegate');
        },
      },
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

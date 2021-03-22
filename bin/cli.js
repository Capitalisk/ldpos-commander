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
  _integerToDecimal,
  _checkDirectoryConfig,
  _storePassphrase,
  _saveConfig,
} = require('../lib/utils');

const NETWORK_SYMBOLS = ['clsk'];

const cli = new REPLClient({
  interactive: true,
  helpFooter: 'LDPoS Commander',
  helpHeader: `This interface can be used both interactively and non-interactively
    Interactively: ldpos
    Non-interactively: ldpos <OPTIONAL: ip or ip:port> <command>\n
    Accepted both interactively and non-interactively:
      <-p: PASSPHRASE>
      <-m: MULTISIGPASSPHRASE>
      <-f: FORGINPASSPHRASE>
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
    } else if (!config.passphrases.hasOwnProperty('passphrase')) {
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
    } else if (!config.passphrases.passphrase)
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
        false,
        true
      );
    }

    try {
      await client.syncAllKeyIndexes();
      console.log('All key indexes synced.');
    } catch (e) {
      cli.errorLog(`Failed to syncAllKeyIndexes: ${e.message}`, 1, false, true);
    }

    if (cli.argv.hasOwnProperty('m')) delete cli.argv.p;
    if (cli.argv.hasOwnProperty('m')) delete cli.argv.m;
    if (cli.argv.hasOwnProperty('f')) delete cli.argv.f;
  }

  /**
   * Get a custom property or display the object returned
   * @param {string} param Custom property that's searched in the object, if not present the object is displayed
   * @param {any} arg Argument passed to the client's function
   * @param {string} fn Function name to call in the client object
   */
  const customProperty = async function (param, arg, fn = 'getAccount') {
    param = this.kebabCaseToCamel(param);

    const data = await client[fn](arg);

    let output;

    if (data[param]) {
      if (
        !Number.isInteger(parseInt(data[param])) ||
        !['fee', 'amount'].includes(param)
      )
        output = data[param];
      else output = _integerToDecimal(data[param]);
    } else {
      output = data;
    }

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
        execute: async function (param = 'wallet') {
          const err = Error('invalid');
          const address = await client.getWalletAddress();
          await customProperty.call(this, param, address);
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
        '<custom-property>': {
          help: 'Get a custom property on the transaction',
        },
        type: {
          help: 'Get the transaction type',
        },
        fee: {
          help: 'Get the transaction fee',
        },
        timestamp: {
          help: 'Get the transaction timestamp',
        },
        message: {
          help: 'Get the transaction message',
        },
        'sender-address': {
          help: 'Get the transaction sender address',
        },
        'sig-public-key': {
          help: 'Get the transaction sig public key',
        },
        'next-sig-public-key': {
          help: 'Get the transaction next sig public key',
        },
        'next-sig-key-index': {
          help: 'Get the transaction next sig key index',
        },
        'sender-signature-hash': {
          help: 'Get the transaction sender signature hash',
        },
        'block-id': {
          help: 'Get the transaction block id',
        },
        'index-in-block': {
          help: 'Get the transaction index in block',
        },
        'new-sig-public-key': {
          help: 'Get the transaction new sig public key',
        },
        'new-next-sig-public-key': {
          help: 'Get the transaction new next sig public key',
        },
        'new-next-sig-key-index': {
          help: 'Get the transaction new next sig key index',
        },
        execute: async function (param = 'transaction') {
          const id = await cli.promptInput('Transaction ID:');
          await customProperty.call(this, param, id, 'getTransaction');
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
        execute: async function (param = 'account') {
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
      get: {
        voteWeight: {
          help: 'Get a delegates vote weight',
        },
        updateHeight: {
          help: 'Get a delegates update height',
        },
        '<custom-property>': {
          help: 'Get a custom property on the delegate',
        },
        execute: async function (param = 'delegate') {
          const address = await cli.promptInput('Delegate address:');
          if (!address) throw new Error('No address provided.');
          await customProperty.call(this, param, address, 'getDelegate');
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

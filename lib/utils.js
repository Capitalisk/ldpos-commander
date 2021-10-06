const fs = require('fs-extra');
const {
  FULL_DIRECTORY_CONFIG,
  SIGNATURE_PATH,
  FULL_CONFIG_PATH,
} = require('./constants');

const _decimalToInteger = (amount) =>
  amount !== '' && Math.floor(parseFloat(amount) * 100000000).toString();

const _integerToDecimal = (amount) =>
  amount !== '' && (parseInt(amount) / 100000000).toString();

async function _checkDirectoryConfig(clean = false) {
  let signaturePath;

  if (await fs.pathExists(FULL_DIRECTORY_CONFIG)) {
    signaturePath = require(FULL_DIRECTORY_CONFIG).defaultPath;
    if (clean) return Promise.resolve(signaturePath);
  } else {
    signaturePath = SIGNATURE_PATH;
  }

  if (!clean) {
    signaturePath =
      (await this.promptInput(
        `\n\n\x1b[33mCAUTION: Tilde (~) does not work!\x1b[0m\nLocation directory of the signatures to use (Default: ${signaturePath}): `
      )) || signaturePath;

    await fs.outputFile(
      FULL_DIRECTORY_CONFIG,
      JSON.stringify({ defaultPath: signaturePath }, null, 2)
    );
  } else {
    signaturePath = SIGNATURE_PATH;
  }

  return Promise.resolve(signaturePath);
}

const _storePassphrase = async (type, config, cli, passphrase) => {
  const save = ['Y', 'y'].includes(
    (await cli.promptInput(
      `LESS SECURE: Would you like to save the ${type.toLowerCase()}? (Y/n)`
    )) || 'n'
  );

  const encodedPassphrases = {};

  for (let i = 0; i < Object.keys(config.passphrases).length; i++) {
    const t = Object.keys(config.passphrases)[i];
    const passphrase = config.passphrases[t];

    encodedPassphrases[t] = Buffer.from(passphrase).toString('base64');
  }

  if (save) {
    await _saveConfig({
      ...config,
      passphrases: {
        ...encodedPassphrases,
        [type]: Buffer.from(passphrase).toString('base64'),
      },
    });
  } else {
    await _saveConfig({
      ...config,
      passphrases: { ...encodedPassphrases, [type]: null },
    });
  }
};

const _saveConfig = async (config) => {
  await fs.outputFile(FULL_CONFIG_PATH, JSON.stringify(config, null, 2));
};

const _parseJsonFile = async (path) => {
  const json = Buffer.from(await fs.readFile(path), 'base64').toString('utf8');
  debugger;
  return Promise.resolve(JSON.parse(json));
};

const _transformMonetaryArrayUnits = (arr) => {
  for (let i = 0; i < arr.length; i++) {
    const el = arr[i];
    if (el.balance) arr[i].balance = _integerToDecimal(el.balance);
    if (el.fee) arr[i].fee = _integerToDecimal(el.fee);
    if (el.amount) arr[i].amount = _integerToDecimal(el.amount);
  }

  return Promise.resolve(arr);
};

module.exports = {
  _decimalToInteger,
  _integerToDecimal,
  _checkDirectoryConfig,
  _storePassphrase,
  _saveConfig,
  _parseJsonFile,
  _transformMonetaryArrayUnits,
};

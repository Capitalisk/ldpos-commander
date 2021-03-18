const fs = require('fs-extra');
const {
  FULL_DIRECTORY_CONFIG,
  SIGNATURE_PATH,
  FULL_CONFIG_PATH,
} = require('./constants');

const _decimalToInteger = (amount) =>
  amount !== '' && (parseFloat(amount) * 100000000).toString();

const _integerToDecimal = (amount) =>
  amount !== '' && (parseInt(amount) / 100000000).toString();

async function _checkDirectoryConfig(clean = false) {
  let signaturePath;

  if (await fs.pathExists(FULL_DIRECTORY_CONFIG)) {
    signaturePath = require(FULL_DIRECTORY_CONFIG).defaultPath;
    if (clean) return Promise.resolve(signaturePath);
  }

  if (!clean) {
    signaturePath =
      (await this.promptInput(
        `Location directory of the signatures do not use ~ (Default: ${
          signaturePath ? signaturePath : SIGNATURE_PATH
        }): `
      )) || signaturePath;

    await _saveConfig({ defaultPath: signaturePath });
  } else {
    signaturePath = SIGNATURE_PATH;
  }

  return Promise.resolve(signaturePath);
}

const _storePassphrase = async (type, config, cli) => {
  const save = ['Y', 'y'].includes(
    (await cli.promptInput(
      `UNSAFE: Would you like to save the ${type.toLowerCase()}? (Y/n)`
    )) || 'n'
  );

  const encodedPassphrases = {};

  // Encode passphrases
  for (let i = 0; i < Object.keys(config.passphrases).length; i++) {
    const type = Object.keys(config.passphrases)[i];
    const passphrase = config.passphrases[type];

    encodedPassphrases[type] = Buffer.from(passphrase).toString('base64');
  }

  if (save) await _saveConfig({ ...config, passphrases: encodedPassphrases });
};

const _saveConfig = async (config) => {
  await fs.outputFile(FULL_CONFIG_PATH, JSON.stringify(config, null, 2));
};

module.exports = {
  _decimalToInteger,
  _integerToDecimal,
  _checkDirectoryConfig,
  _storePassphrase,
  _saveConfig,
};

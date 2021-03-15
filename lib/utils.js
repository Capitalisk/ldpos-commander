const fs = require('fs-extra');
const { FULL_DIRECTORY_CONFIG, SIGNATURE_PATH } = require('./constants');

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

    await fs.outputFile(
      FULL_DIRECTORY_CONFIG,
      JSON.stringify({ defaultPath: signaturePath }, null, 2)
    );
  } else {
    signaturePath = SIGNATURE_PATH;
  }

  return Promise.resolve(signaturePath);
}

module.exports = {
  _decimalToInteger,
  _integerToDecimal,
  _checkDirectoryConfig,
};

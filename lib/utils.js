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
  } else {
    // For cleaning purposes
    if (clean) return Promise.resolve(SIGNATURE_PATH);

    signaturePath =
      (await this.promptInput(
        `Location directory of the signatures do not use ~ (Default: ${SIGNATURE_PATH}): `
      )) || SIGNATURE_PATH;

    await fs.mkdirp(signaturePath);

    if (signaturePath !== SIGNATURE_PATH) {
      const save =
        ((await this.promptInput(
          'Save this as the default location? (Y/n) (Default: Y)'
        )) || 'Y') === 'Y'
          ? true
          : false;

      if (save) {
        await fs.outputFile(
          FULL_DIRECTORY_CONFIG,
          JSON.stringify({ defaultPath: signaturePath }, null, 2)
        );
      }
    }
  }

  return Promise.resolve(signaturePath);
}

module.exports = {
  _decimalToInteger,
  _integerToDecimal,
  _checkDirectoryConfig,
};

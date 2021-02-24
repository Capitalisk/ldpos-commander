// Gets users home dir to store config files
const CONFIG_PATH = process.env.APPDATA
  ? `${process.env.APPDATA}\\`
  : process.platform == 'darwin'
  ? process.env.HOME + '/Library/Preferences/'
  : process.env.HOME + '/.local/share/';

const CONFIG_FILE = 'ldpos-config.json';

const FULL_CONFIG_PATH = `${CONFIG_PATH}${CONFIG_FILE}`;

// TAKEN FROM NPM NODULE LDPOS-CHAIN
const DEFAULT_MIN_TRANSACTION_FEES = {
  transfer: '10000000',
  vote: '20000000',
  unvote: '20000000',
  registerSigDetails: '10000000',
  registerMultisigDetails: '10000000',
  registerForgingDetails: '10000000',
  registerMultisigWallet: '50000000',
};

module.exports = {
  FULL_CONFIG_PATH,
  DEFAULT_MIN_TRANSACTION_FEES,
};

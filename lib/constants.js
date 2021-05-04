// Gets users home dir to store config files
const CONFIG_PATH = process.env.APPDATA
  ? `${process.env.APPDATA}\\ldpos-commander\\`
  : process.platform == 'darwin'
  ? process.env.HOME + '/Library/Preferences/ldpos-commander/'
  : process.env.HOME + '/.local/share/ldpos-commander/';

const SIGNATURE_PATH = `${CONFIG_PATH}signatures/`;

const CONFIG_FILE = 'ldpos-config.json';

const FULL_CONFIG_PATH = `${CONFIG_PATH}${CONFIG_FILE}`;

const DIRECTORY_FILE = 'ldpos-multisig-config.json';

const FULL_DIRECTORY_CONFIG = `${CONFIG_PATH}${DIRECTORY_FILE}`;

const KEY_INDEX_DIRECTORY = `${CONFIG_PATH}key-indexes`;

module.exports = {
  FULL_CONFIG_PATH,
  SIGNATURE_PATH,
  CONFIG_PATH,
  FULL_DIRECTORY_CONFIG,
  KEY_INDEX_DIRECTORY,
};

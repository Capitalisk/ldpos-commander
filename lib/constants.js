// Gets users home dir to store config files
const CONFIG_PATH = process.env.APPDATA
  ? `${process.env.APPDATA}\\`
  : process.platform == 'darwin'
  ? process.env.HOME + '/Library/Preferences/'
  : process.env.HOME + '/.local/share/';

const CONFIG_FILE = 'ldpos-config.json';

const FULL_CONFIG_PATH = `${CONFIG_PATH}${CONFIG_FILE}`;

module.exports = {
  FULL_CONFIG_PATH,
};

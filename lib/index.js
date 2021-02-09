const inquirer = require('inquirer');
const childProcess = require('child_process');
const util = require('util');
const prompt = inquirer.createPromptModule();

/**
 * Prompt wrapper function
 * @param {string} message Prompt message
 * @param {boolean} secret When true input is hidden
 */
const promptInput = async (message, secret) => {
  const answer = await prompt([
    {
      type: secret ? 'password' : 'input',
      message,
      name: 'result',
      default: null,
    },
  ]);
  return answer.result;
};

const passphrasePrompt = async () => await promptInput('Passphrase:', true) || 'clerk aware give dog reopen peasant duty cheese tobacco trouble gold angle';

//prettier-ignore
const networkSymbolPrompt = async () => await promptInput('Network symbol: (Default: ldpos)') || 'ldpos';

/**
 * Handles error log output
 * @param {string} errorMsg String to display as error
 */
const errorLog = (errorMsg) => {
  console.log(`\x1b[1m\x1b[31mError: ${errorMsg}\x1b[0m`);
  console.log(
    '\x1b[1m\x1b[31m\nIf that didnt help you, please post an issue in the repo: \nhttps://github.com/Leasehold/ldpos-commander\x1b[0m'
  );
  process.exit();
};

/**
 * Handles success log output
 * @param {string} successMsg String to display as error
 */
const successLog = (successMsg) => {
  console.log(`\x1b[1m\x1b[32m${successMsg}\x1b[0m`);
  process.exit();
};

const exec = util.promisify(childProcess.exec);
const spawn = util.promisify(childProcess.spawn);
const fork = util.promisify(childProcess.fork);

// Gets users home dir to store config files
const configPath = process.env.APPDATA
  ? `${process.env.APPDATA}\\`
  : process.platform == 'darwin'
  ? process.env.HOME + '/Library/Preferences/'
  : process.env.HOME + '/.local/share/';

module.exports = {
  promptInput,
  exec,
  spawn,
  fork,
  configPath,
  errorLog,
  successLog,
  passphrasePrompt,
  networkSymbolPrompt,
};

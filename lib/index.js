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
  const answer = await prompt([{ type: secret ? 'password' : 'input', message, name: 'result', default: null }])
  return answer.result
}

/**
 * 
 * @param {string} errorMsg String to display as error
 */
const errorLog = (errorMsg)  => {
  console.log(`\x1b[1m\x1b[31mError: ${errorMsg}`)
  console.log(
    '\x1b[1m\x1b[31mPlease post an issue on the repo: https://github.com/Leasehold/ldpos-commander'
  );
  process.exit();
}

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
}

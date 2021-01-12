#!/usr/bin/env node

const fs = require('fs-extra');
const argv = require('minimist')(process.argv.slice(2));
const childProcess = require('child_process');
const inquirer = require('inquirer');
const prompt = inquirer.createPromptModule();
const util = require('util');
const exec = util.promisify(childProcess.exec);
const spawn = util.promisify(childProcess.spawn);
const fork = util.promisify(childProcess.fork);

let command = argv._[0];

// TODO: Implement

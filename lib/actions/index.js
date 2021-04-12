const transaction = require('./transaction');
const account = require('./account');
const wallet = require('./wallet');
const delegates = require('./delegates');
const login = require('./login');

module.exports = {
  ...transaction,
  ...account,
  ...wallet,
  ...delegates,
  ...login,
};

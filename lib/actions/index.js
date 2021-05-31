const transaction = require('./transaction');
const account = require('./account');
const delegate = require('./delegate');
const block = require('./block');

module.exports = {
  ...transaction,
  ...account,
  ...delegate,
  ...block,
};

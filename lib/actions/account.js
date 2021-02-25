const { _integerToDecimals } = require('../utils');

const listAccountsByBalance = async function (
  client,
  pageInfo = { offset: 1, limit: 1, pageNumber: 1, order: 'asc' }
) {
  let accounts = await client.getAccountsByBalance(
    pageInfo.offset,
    pageInfo.limit,
    pageInfo.pageInfo
  );

  accounts = accounts.map((account) => ({
    ...account,
    balance: _integerToDecimals(account.balance),
  }));

  await this.pagination(accounts, pageInfo, 1, listAccountsByBalance, [
    client,
    pageInfo,
  ]);
};

const listMultisigWalletMembers = async function (client) {
  const wallet = await this.promptInput('Wallet address:');
  const account = await client.listMultisigWalletMembers(wallet);

  this.successLog(account, 'Found members:');
};

// TODO: Implement
const getMultisigPublicKey = async function (client) {};

const getBalance = async function (client) {
  const wallet = await this.promptInput('Wallet address:');
  const { balance } = await client.getAccount(wallet);

  this.successLog(_integerToDecimals(balance), 'Balance:');
};

const getWallet = async function (client) {
  const wallet = await this.promptInput('Wallet address:');
  const account = await client.getAccount(wallet);

  account.balance = _integerToDecimals(account.balance)

  this.successLog(account, 'Found account:');
};

module.exports = {
  listAccountsByBalance,
  listMultisigWalletMembers,
  getWallet,
  getBalance,
  getMultisigPublicKey
};

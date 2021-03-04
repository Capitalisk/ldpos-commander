const { _integerToDecimal } = require('../utils');

const listAccountsByBalance = async function (
  client,
  pageInfo = { offset: 0, limit: 1, pageNumber: 1, order: 'asc' }
) {
  let accounts = await client.getAccountsByBalance(
    pageInfo.offset,
    pageInfo.limit,
    pageInfo.pageInfo
  );

  accounts = accounts.map((account) => ({
    ...account,
    balance: _integerToDecimal(account.balance),
  }));

  await this.pagination(accounts, pageInfo, 1, listAccountsByBalance, [
    client,
    pageInfo,
  ]);
};

const listMultisigWalletMembers = async function (client) {
  const wallet = await this.promptInput('Wallet address:');
  const account = await client.getMultisigWalletMembers(wallet);

  this.successLog(account, 'Found members:');
};

const getMultisigPublicKey = async function (client) {
  const wallet = await this.promptInput('Wallet address:');
  const { multisigPublicKey } = await client.getAccount(wallet);

  this.successLog(multisigPublicKey, 'public key:');
};

const getPublicKey = async function (client) {
  const wallet = await this.promptInput('Wallet address:');
  const { sigPublicKey } = await client.getAccount(wallet);

  this.successLog(sigPublicKey, 'public key:');
};

const getBalance = async function (client) {
  const wallet = await this.promptInput('Wallet address:');
  const { balance } = await client.getAccount(wallet);

  this.successLog(_integerToDecimal(balance), 'Balance:');
};

const getWallet = async function (client) {
  const wallet = await this.promptInput('Wallet address:');
  const account = await client.getAccount(wallet);

  account.balance = _integerToDecimal(account.balance);

  this.successLog(account, 'Found account:');
};

module.exports = {
  listAccountsByBalance,
  listMultisigWalletMembers,
  getWallet,
  getBalance,
  getMultisigPublicKey,
  getPublicKey,
};

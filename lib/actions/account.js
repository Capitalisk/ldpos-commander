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

const listPendingOutboundTransactions = async function (
  client,
  pageInfo = { offset: 0, limit: 1, pageNumber: 1, order: 'asc' }
) {
  let transactions = await client.getOutboundPendingTransactions(
    client.getWalletAddress(),
    pageInfo.offset,
    pageInfo.limit
  );

  transactions = transactions.map((account) => ({
    ...account,
    balance: _integerToDecimal(account.balance),
  }));

  await this.pagination(transactions, pageInfo, 1, listPendingOutboundTransactions, [
    client,
    pageInfo,
  ]);
};

module.exports = {
  listAccountsByBalance,
  listMultisigWalletMembers,
  listPendingOutboundTransactions,
};

const { _integerToDecimals } = require('../utils');

const balance = async function (client) {
  const address = await client.getWalletAddress();

  const { balance } = await client.getAccount(address);
  this.successLog(_integerToDecimals(balance), 'balance:');
};

// TODO: This to pagination
const transactions = async function (client) {
  let transactions = await client.getTransactionsByTimestamp(0, 100);

  transactions = transactions.map((transaction) => ({
    ...transaction,
    amount: _integerToDecimals(transaction.amount),
    fee: _integerToDecimals(transaction.fee),
  }));

  this.successLog(transactions, 'transactions:');
};

const votes = async function (client) {
  const accountVotes = await client.getAccountVotes(client.walletAddress);
  this.successLog(accountVotes, 'account votes:');
};

module.exports = {
  balance,
  transactions,
  votes,
};

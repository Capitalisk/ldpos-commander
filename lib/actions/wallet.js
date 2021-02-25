const { _integerToDecimal } = require('../utils');

const balance = async function (client) {
  const address = await client.getWalletAddress();

  const { balance } = await client.getAccount(address);
  this.successLog(_integerToDecimal(balance), 'balance:');
};

// TODO: This to pagination
const transactions = async function (client) {
  let transactions = await client.getTransactionsByTimestamp(0, 100);

  transactions = transactions.map((transaction) => ({
    ...transaction,
    amount: _integerToDecimal(transaction.amount),
    fee: _integerToDecimal(transaction.fee),
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

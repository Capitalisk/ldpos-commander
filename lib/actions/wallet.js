const { _integerToDecimal } = require('../utils');

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
  transactions,
  votes,
};

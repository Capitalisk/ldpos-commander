const balance = async function (client) {
  const address = await client.getWalletAddress();

  const { balance } = await client.getAccount(address);
  this.successLog(balance, 'balance:');
};

// TODO: This to pagination
const transactions = async function (client) {
  const transactions = await client.getTransactionsByTimestamp(0, 100);
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

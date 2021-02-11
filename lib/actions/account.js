const balance = async ({ client, successLog, config }) => {
  const accounts = await client.getAccountsByBalance(0, 100);
  successLog(accounts, 'accounts:', config.interactive);
};

const transactions = async ({ client, successLog, config }) => {
  const transactions = await client.getTransactionsByTimestamp(0, 100);
  successLog(transactions, 'transactions:', config.interactive);
};

const votes = async ({ client, successLog, config }) => {
  const accountVotes = await client.getAccountVotes(client.walletAddress);
  successLog(accountVotes, 'account votes:', config.interactive);
};

const block = async ({ client, successLog, config }) => {
  let block = await client.getBlockAtHeight(2);
  successLog(block, 'block:', config.interactive);
};

const list = async ({ client, successLog, config }) => {
  const accountList = await client.getAccountsByBalance(0, 10, 'desc');
  successLog(accountList, 'account list:', config.interactive);
};

const pendingTransactions = async ({ client, successLog, config }) => {
  const pendingTxnCount = await client.getPendingTransactionCount();
  successLog(pendingTxnCount, 'pending transaction count:', config.interactive);
};

module.exports = {
  balance,
  transactions,
  votes,
  block,
  list,
  pendingTransactions,
};

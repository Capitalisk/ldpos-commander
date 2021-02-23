const balance = async function (client) {
  const address = await client.getWalletAddress();

  const { balance } = await client.getAccount(address);
  this.successLog(balance, 'balance:');
};

const transactions = async function (client) {
  const transactions = await client.getTransactionsByTimestamp(0, 100);
  this.successLog(transactions, 'transactions:');
};

const votes = async function (client) {
  const accountVotes = await client.getAccountVotes(client.walletAddress);
  this.successLog(accountVotes, 'account votes:');
};

const block = async function (client) {
  let block = await client.getBlockAtHeight(2);
  this.successLog(block, 'block:');
};

const listAccountsByBalance = async function (
  client,
  pageInfo = { offset: 1, limit: 1, pageNumber: 1, order: 'asc' }
) {
  const accounts = await client.getAccountsByBalance(
    pageInfo.offset,
    pageInfo.limit,
    pageInfo.pageInfo
  );

  await this.pagination(accounts, pageInfo, 1, listAccountsByBalance, [
    client,
    pageInfo,
  ]);
};

const pendingTransactions = async function (client) {
  const pendingTxnCount = await client.getPendingTransactionCount();
  this.successLog(pendingTxnCount, 'pending transaction count:');
};

module.exports = {
  balance,
  transactions,
  votes,
  block,
  listAccountsByBalance,
  pendingTransactions,
};

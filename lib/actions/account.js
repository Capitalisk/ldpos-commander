const balance = async (self) => {
  const accounts = await self.client.getAccountsByBalance(0, 100);
  self.successLog(accounts, 'accounts:');
};

const transactions = async (self) => {
  const transactions = await self.client.getTransactionsByTimestamp(0, 100);
  self.successLog(transactions, 'transactions:');
};

const votes = async (self) => {
  const accountVotes = await self.client.getAccountVotes(client.walletAddress);
  self.successLog(accountVotes, 'account votes:');
};

const block = async (self) => {
  let block = await self.client.getBlockAtHeight(2);
  self.successLog(block, 'block:');
};

const list = async (self) => {
  const accountList = await self.client.getAccountsByBalance(0, 10, 'desc');
  self.successLog(accountList, 'account list:');
};

const pendingTransactions = async (self) => {
  const pendingTxnCount = await self.client.getPendingTransactionCount();
  self.successLog(pendingTxnCount, 'pending transaction count:');
};

module.exports = {
  balance,
  transactions,
  votes,
  block,
  list,
  pendingTransactions,
};

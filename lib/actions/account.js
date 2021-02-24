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

const listMultisigWalletMembers = async function (client) {
  try {
    const wallet = await this.promptInput('Wallet address:');
    const account = await client.listMultisigWalletMembers(wallet);

    this.successLog(account, 'Found members:');
  } catch (e) {
    this.errorLog(e.message);
  }
};

const getBalance = async function (client) {
  try {
    const wallet = await this.promptInput('Wallet address:');
    const { balance } = await client.getAccount(wallet);

    this.successLog(balance, 'Balance:');
  } catch (e) {
    this.errorLog(e.message);
  }
};

const getWallet = async function (client) {
  try {
    const wallet = await this.promptInput('Wallet address:');
    const account = await client.getAccount(wallet);

    this.successLog(account, 'Found account:');
  } catch (e) {
    this.errorLog(e.message);
  }
};

module.exports = {
  listAccountsByBalance,
  pendingTransactions,
  listMultisigWalletMembers,
  getWallet,
  getBalance,
};

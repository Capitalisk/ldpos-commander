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

const listMultisigWalletMembers = async function (client) {
  const wallet = await this.promptInput('Wallet address:');
  const account = await client.listMultisigWalletMembers(wallet);

  this.successLog(account, 'Found members:');
};

const getBalance = async function (client) {
  const wallet = await this.promptInput('Wallet address:');
  const { balance } = await client.getAccount(wallet);

  this.successLog(balance, 'Balance:');
};

const getWallet = async function (client) {
  const wallet = await this.promptInput('Wallet address:');
  const account = await client.getAccount(wallet);

  this.successLog(account, 'Found account:');
};

module.exports = {
  listAccountsByBalance,
  listMultisigWalletMembers,
  getWallet,
  getBalance,
};

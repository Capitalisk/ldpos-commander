const getWallet = async function (client) {
  try {
    const wallet = await this.promptInput('Wallet address:');
    const account = await client.getAccount(wallet);

    this.successLog(account, 'Found account:');
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

const getMultisigWalletMembers = async function (client) {
  try {
    const wallet = await this.promptInput('Wallet address:');
    const account = await client.getMultisigWalletMembers(wallet);

    this.successLog(account, 'Found members:');
  } catch (e) {
    this.errorLog(e.message);
  }
};

module.exports = {
  getWallet,
  getMultisigWalletMembers,
  getBalance,
};

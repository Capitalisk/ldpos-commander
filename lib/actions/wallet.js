const getWallet = async (self) => {
  try {
    const wallet = await self.promptInput('Wallet address:');
    const account = await self.client.getAccount(wallet);

    self.successLog(account, 'Found account:');
  } catch (e) {
    self.errorLog(e.message);
  }
};

const getBalance = async (self) => {
  try {
    const wallet = await self.promptInput('Wallet address:');
    const {balance} = await self.client.getAccount(wallet);

    self.successLog(balance, 'Balance:');
  } catch (e) {
    self.errorLog(e.message);
  }
};

const getMultisigWalletMembers = async (self) => {
  try {
    const wallet = await self.promptInput('Wallet address:');
    const account = await self.client.getMultisigWalletMembers(wallet);

    self.successLog(account, 'Found members:');
  } catch (e) {
    self.errorLog(e.message);
  }
};

module.exports = {
  getWallet,
  getMultisigWalletMembers,
  getBalance
};

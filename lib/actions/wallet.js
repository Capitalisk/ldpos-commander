const getWallet = async (self) => {
  try {
    const wallet = await self.promptInput('Wallet address:');
    const account = await self.client.getAccount(wallet);

    self.successLog(account, 'Found account:');
  } catch (e) {
    self.errorLog(e.message);
  }
};

module.exports = {
  getWallet,
};

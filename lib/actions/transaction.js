const transfer = async (self) => {
  // prettier-ignore
  const recipientAddress = await self.promptInput('Address of the recipient:') || 'ldpos75fbb06210575fd8f7f62e0b9267d4386273fc80'
  // prettier-ignore
  const amount = await self.promptInput('Amount of the transfer:') || `${Math.floor(Math.random() * 1)}000000000`
  // TODO: What should this be?
  // const fee = await self.promptInput('Fee:')
  // prettier-ignore
  const message = await self.promptInput('Message to send of the recipient:') || ''

  const preparedTxn = await self.client.prepareTransaction({
    type: 'transfer',
    recipientAddress,
    amount,
    fee: `10000000`,
    timestamp: 100000,
    message,
  });

  await self.client.postTransaction(preparedTxn);

  self.successLog(
    `Transfer to wallet ${preparedTxn.recipientAddress} completed.`
  );
};

const vote = async (self) => {
  // prettier-ignore
  const delegateAddress = await self.promptInput('Address of the recipient:') || 'ldpos75fbb06210575fd8f7f62e0b9267d4386273fc80'
  const message =
    (await self.promptInput('Message to send of the recipient:')) || '';

  const voteTxn = await self.client.prepareTransaction({
    type: 'vote',
    delegateAddress,
    fee: `20000000`,
    timestamp: 200000,
    message,
  });

  await self.client.postTransaction(voteTxn);
  self.successLog(voteTxn.delegateAddress, `Vote to delegate successfull:`);
};

const unvote = async (self) => {
  // prettier-ignore
  const delegateAddress = await self.promptInput('Address of the recipient:') || 'ldpos75fbb06210575fd8f7f62e0b9267d4386273fc80'
  const message =
    (await self.promptInput('Message to send of the recipient:')) || '';

  const unvoteTxn = await self.client.prepareTransaction({
    type: 'unvote',
    delegateAddress,
    fee: `20000000`,
    timestamp: 200000,
    message,
  });

  await self.client.postTransaction(unvoteTxn);
  self.successLog(unvoteTxn.delegateAddress, `Unvote to delegate successfull:`);
};

const multisignTransfer = async (self) => {
  // prettier-ignore
  const recipientAddress = await self.promptInput('Address of the recipient:') || 'ldpos75fbb06210575fd8f7f62e0b9267d4386273fc80'
  // prettier-ignore
  const amount = await self.promptInput('Amount of the transfer:') || `${Math.floor(Math.random() * 1)}000000000`
  // TODO: What should this be?
  // const fee = await self.promptInput('Fee:')
  // prettier-ignore
  const message = await self.promptInput('Message to send of the recipient:') || ''

  const preparedMultisigTxn = await self.client.prepareMultisigTransaction({
    type: 'transfer',
    recipientAddress,
    amount,
    fee: `10000000`,
    timestamp: 100000,
    message,
  });

  const multisigTxnSignature = await self.client.signMultisigTransaction(
    preparedMultisigTxn
  );
  self.successLog(multisigTxnSignature, 'Multisig transaction signature:');
};

const verifyTransaction = async (self) => {
  // TODO: Probably needs more inputs here
  const transaction = await self.promptInput('Transaction:');

  const verifiedTransaction = await self.client.verifiedTransaction(
    transaction
  );

  self.successLog(verifiedTransaction, 'Transaction verified:');
};

const registerMultisigWallet = async (self) => {
  // TODO: Implement this
  console.log('registerMultisigWallet');
};

const registerMultisigDetails = async (self) => {
  // TODO: Implement this
  console.log('registerMultisigDetails');
};

const registerSigDetails = async (self) => {
  // TODO: Implement this
  console.log('registerSigDetails');
};

const registerForgingDetails = async (self) => {
  // TODO: Implement this
  console.log('registerForgingDetails');
};

module.exports = {
  transfer,
  vote,
  unvote,
  registerMultisigWallet,
  registerMultisigDetails,
  registerSigDetails,
  multisignTransfer,
  registerForgingDetails,
  verifyTransaction,
};

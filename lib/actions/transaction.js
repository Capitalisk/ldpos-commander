const transfer = async function (client) {
  // prettier-ignore
  const recipientAddress = await this.promptInput('Address of the recipient:') || 'ldpos75fbb06210575fd8f7f62e0b9267d4386273fc80'
  // prettier-ignore
  const amount = await this.promptInput('Amount of the transfer:') || `${Math.floor(Math.random() * 1)}000000000`
  // TODO: What should this be?
  // const fee = await this.promptInput('Fee:')
  // prettier-ignore
  const message = await this.promptInput('Message to send of the recipient:') || ''

  const preparedTxn = await client.prepareTransaction({
    type: 'transfer',
    recipientAddress,
    amount,
    fee: `10000000`,
    timestamp: 100000,
    message,
  });

  await client.postTransaction(preparedTxn);

  self.successLog(
    `Transfer to wallet ${preparedTxn.recipientAddress} completed.`
  );
};

const vote = async function (client) {
  // prettier-ignore
  const delegateAddress = await this.promptInput('Address of the recipient:') || 'ldpos75fbb06210575fd8f7f62e0b9267d4386273fc80'
  const message =
    (await this.promptInput('Message to send of the recipient:')) || '';

  const voteTxn = await client.prepareTransaction({
    type: 'vote',
    delegateAddress,
    fee: `20000000`,
    timestamp: 200000,
    message,
  });

  await client.postTransaction(voteTxn);
  self.successLog(voteTxn.delegateAddress, `Vote to delegate successfull:`);
};

const unvote = async function (client) {
  // prettier-ignore
  const delegateAddress = await this.promptInput('Address of the recipient:') || 'ldpos75fbb06210575fd8f7f62e0b9267d4386273fc80'
  const message =
    (await this.promptInput('Message to send of the recipient:')) || '';

  const unvoteTxn = await client.prepareTransaction({
    type: 'unvote',
    delegateAddress,
    fee: `20000000`,
    timestamp: 200000,
    message,
  });

  await client.postTransaction(unvoteTxn);
  self.successLog(unvoteTxn.delegateAddress, `Unvote to delegate successfull:`);
};

const multisignTransfer = async function (client) {
  // prettier-ignore
  const recipientAddress = await this.promptInput('Address of the recipient:') || 'ldpos75fbb06210575fd8f7f62e0b9267d4386273fc80'
  // prettier-ignore
  const amount = await this.promptInput('Amount of the transfer:') || `${Math.floor(Math.random() * 1)}000000000`
  // TODO: What should this be?
  // const fee = await this.promptInput('Fee:')
  // prettier-ignore
  const message = await this.promptInput('Message to send of the recipient:') || ''

  const preparedMultisigTxn = await client.prepareMultisigTransaction({
    type: 'transfer',
    recipientAddress,
    amount,
    fee: `10000000`,
    timestamp: 100000,
    message,
  });

  const multisigTxnSignature = await client.signMultisigTransaction(
    preparedMultisigTxn
  );
  self.successLog(multisigTxnSignature, 'Multisig transaction signature:');
};

const verifyTransaction = async function (client) {
  // TODO: Probably needs more inputs here
  const transaction = await this.promptInput('Transaction:');

  const verifiedTransaction = await client.verifiedTransaction(transaction);

  self.successLog(verifiedTransaction, 'Transaction verified:');
};

const registerMultisigWallet = async function (client) {
  const count = await this.promptInput('Count of memberAddresses to be added:');

  const memberAddresses = [];
  for (let i = 0; i < count; i++) {
    memberAddresses.push(await this.promptInput('Member address:'));
  }

  const requiredSignatureCount = await this.promptInput('Signature count:');
  const message = await this.promptInput('Message (optional):');
  const fee = await this.promptInput('Fee:');

  const wallet = self.prepareRegisterMultisigWallet({
    memberAddresses,
    requiredSignatureCount,
    message,
    fee,
  });

  await client.postTransaction(wallet);

  self.successLog(wallet, 'Wallet registered:');
};

const registerMultisigDetails = async function (client) {
  const newNextMultisigKeyIndex = await this.promptInput(
    'newNextMultisigKeyIndex (Default: 0):'
  );
  const multisigPassphrase = await this.promptInput(
    'Multisig passphrase (optional):'
  );
  const message = await this.promptInput('Message (optional):');
  const fee = await this.promptInput('Fee:');

  const details = self.prepareRegisterMultisigDetails({
    newNextMultisigKeyIndex,
    multisigPassphrase,
    message,
    fee,
  });

  await client.postTransaction(details);

  self.successLog(details, 'Details registered:');
};

const registerSigDetails = async function (client) {
  // TODO: Implement this
  console.log('registerSigDetails');
};

const registerForgingDetails = async function (client) {
  const newNextForgingKeyIndex = await this.promptInput(
    'newNextForgingKeyIndex (Default: 0):'
  );
  const forgingPassphrase = await this.promptInput(
    'Forging passphrase (optional):'
  );
  const message = await this.promptInput('Message (optional):');
  const fee = await this.promptInput('Fee:');

  const details = self.prepareRegisterMultisigDetails({
    newNextForgingKeyIndex,
    forgingPassphrase,
    message,
    fee,
  });

  await client.postTransaction(details);

  self.successLog(details, 'Details registered:');
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

const { DEFAULT_MIN_TRANSACTION_FEES } = require('../constants');

const transfer = async function (client) {
  // prettier-ignore
  const recipientAddress = await this.promptInput('Address of the recipient:') || 'ldpos75fbb06210575fd8f7f62e0b9267d4386273fc80'
  // prettier-ignore
  const amount = await this.promptInput('Amount of the transfer:') || `${Math.floor(Math.random() * 1)}000000000`
  // TODO: What should this be?
  const fee = await this.promptInput('Fee:') || DEFAULT_MIN_TRANSACTION_FEES.transfer;
  // prettier-ignore
  const message = await this.promptInput('Message to send of the recipient:') || ''

  const preparedTxn = await client.prepareTransaction({
    type: 'transfer',
    recipientAddress,
    amount,
    fee,
    timestamp: Date.now(),
    message,
  });

  await client.postTransaction(preparedTxn);

  this.successLog(
    `Transfer to wallet ${preparedTxn.recipientAddress} completed.`
  );
};

const vote = async function (client) {
  // prettier-ignore
  const delegateAddress = await this.promptInput('Address of the recipient:') || 'ldpos75fbb06210575fd8f7f62e0b9267d4386273fc80'
  const fee = await this.promptInput('Fee:') || DEFAULT_MIN_TRANSACTION_FEES.vote;
  const message =
    (await this.promptInput('Message to send of the recipient:')) || '';

  const voteTxn = await client.prepareTransaction({
    type: 'vote',
    delegateAddress,
    fee,
    timestamp: Date.now(),
    message,
  });

  await client.postTransaction(voteTxn);
  this.successLog(voteTxn.delegateAddress, `Vote to delegate successfull:`);
};

const unvote = async function (client) {
  // prettier-ignore
  const delegateAddress = await this.promptInput('Address of the recipient:') || 'ldpos75fbb06210575fd8f7f62e0b9267d4386273fc80'
  const fee = await this.promptInput('Fee:') || DEFAULT_MIN_TRANSACTION_FEES.unvote;
  const message =
    (await this.promptInput('Message to send of the recipient:')) || '';

  const unvoteTxn = await client.prepareTransaction({
    type: 'unvote',
    delegateAddress,
    fee,
    timestamp: Date.now(),
    message,
  });

  await client.postTransaction(unvoteTxn);
  this.successLog(unvoteTxn.delegateAddress, `Unvote to delegate successfull:`);
};

const multisigTransfer = async function (client) {
  // prettier-ignore
  const recipientAddress = await this.promptInput('Address of the recipient:') || 'ldpos75fbb06210575fd8f7f62e0b9267d4386273fc80'
  // prettier-ignore
  const amount = await this.promptInput('Amount of the transfer:') || `${Math.floor(Math.random() * 1)}000000000`
  // TODO: What should this be?
  const fee = await this.promptInput('Fee:') || DEFAULT_MIN_TRANSACTION_FEES.transfer;
  // prettier-ignore
  const message = await this.promptInput('Message to send of the recipient:') || ''

  const preparedMultisigTxn = await client.prepareMultisigTransaction({
    type: 'transfer',
    recipientAddress,
    amount,
    fee,
    timestamp: Date.now(),
    message,
  });

  const multisigTxnSignature = await client.signMultisigTransaction(
    preparedMultisigTxn
  );
  this.successLog(multisigTxnSignature, 'Multisig transaction signature:');
};

const verifyTransaction = async function (client) {
  // TODO: Probably needs more inputs here
  const transaction = await this.promptInput('Transaction:');

  const verifiedTransaction = await client.verifiedTransaction(transaction);

  this.successLog(verifiedTransaction, 'Transaction verified:');
};

const registerMultisigWallet = async function (client) {
  const count = await this.promptInput('Count of memberAddresses to be added:');

  const memberAddresses = [];
  for (let i = 0; i < count; i++) {
    memberAddresses.push(await this.promptInput('Member address:'));
  }

  const requiredSignatureCount = await this.promptInput('Signature count:');
  const message = await this.promptInput('Message (optional):');
  const fee = await this.promptInput('Fee:') || DEFAULT_MIN_TRANSACTION_FEES.registerMultisigWallet;

  const wallet = await client.prepareRegisterMultisigWallet({
    memberAddresses,
    requiredSignatureCount,
    message,
    fee,
  });

  await client.postTransaction(wallet);

  this.successLog(wallet, 'Wallet registered:');
};

const registerMultisigDetails = async function (client) {
  const newNextMultisigKeyIndex = await this.promptInput(
    'newNextMultisigKeyIndex (Default: 0):'
  );
  const multisigPassphrase = await this.promptInput(
    'Multisig passphrase (optional):'
  );
  const message = await this.promptInput('Message (optional):');
  const fee = await this.promptInput('Fee:') || DEFAULT_MIN_TRANSACTION_FEES.registerMultisigDetails;

  const details = await client.prepareRegisterMultisigDetails({
    newNextMultisigKeyIndex,
    multisigPassphrase,
    message,
    fee,
  });

  await client.postTransaction(details);

  this.successLog(details, 'Details registered:');
};

const registerSigDetails = async function (client) {
  const newNextSigKeyIndex = await this.promptInput(
    'newNextSigKeyIndex (Default: 0):'
  );
  const sigPassphrase = await this.promptInput('Sig passphrase (optional):');
  const message = await this.promptInput('Message (optional):');
  const fee = await this.promptInput('Fee:') || DEFAULT_MIN_TRANSACTION_FEES.registerSigDetails;

  const details = await client.prepareRegisterMultisigDetails({
    newNextSigKeyIndex,
    sigPassphrase,
    message,
    fee,
  });

  await client.postTransaction(details);

  this.successLog(details, 'Details registered:');
};

const registerForgingDetails = async function (client) {
  const newNextForgingKeyIndex = await this.promptInput(
    'newNextForgingKeyIndex (Default: 0):'
  );
  const forgingPassphrase = await this.promptInput(
    'Forging passphrase (optional):'
  );
  const message = await this.promptInput('Message (optional):');
  const fee = await this.promptInput('Fee:') || DEFAULT_MIN_TRANSACTION_FEES.registerForgingDetails;

  const details = await client.prepareRegisterMultisigDetails({
    newNextForgingKeyIndex,
    forgingPassphrase,
    message,
    fee,
  });

  await client.postTransaction(details);

  this.successLog(details, 'Details registered:');
};

module.exports = {
  transfer,
  vote,
  unvote,
  registerMultisigWallet,
  registerMultisigDetails,
  registerSigDetails,
  multisigTransfer,
  registerForgingDetails,
  verifyTransaction,
};

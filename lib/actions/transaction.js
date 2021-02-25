const { DEFAULT_MIN_TRANSACTION_FEES } = require('../constants');

const transfer = async function (client) {
  const recipientAddress = await this.promptInput('Address of the recipient:');
  if (recipientAddress === '') throw new Error('You should provide an address');

  const amount = (
    parseFloat(await this.promptInput('Amount of the transfer:')) * 100000000
  ).toString();
  if (typeof parseFloat(amount) !== 'number')
    throw new Error('Invalid amount.');

  const fee =
    (await this.promptInput(
      `Fee (Default: ${DEFAULT_MIN_TRANSACTION_FEES.transfer})`
    )) || DEFAULT_MIN_TRANSACTION_FEES.transfer;
  const message =
    (await this.promptInput('Message to send of the recipient:')) || '';

  console.log(
    `Sending ${
      parseFloat(amount) / 100000000
    } token to ${recipientAddress} with a fee of ${fee}`
  );

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
  const delegateAddress = await this.promptInput('Address of the recipient:');
  if (delegateAddress === '') throw new Error('You should provide an address');

  const validAddress = await client.getAccount(delegateAddress);
  if (!validAddress) throw new Error('Invalid address.');

  const fee =
    (await this.promptInput(
      `Fee (Default: ${DEFAULT_MIN_TRANSACTION_FEES.vote})`
    )) || DEFAULT_MIN_TRANSACTION_FEES.vote;
  const message =
    (await this.promptInput('Message to send of the delegate:')) || '';

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
  const delegateAddress = await this.promptInput('Address of the delegate:');
  if (delegateAddress === '') throw new Error('You should provide an address');

  const validAddress = await client.getAccount(delegateAddress);
  if (!validAddress) throw new Error('Invalid address.');

  const fee =
    (await this.promptInput(
      `Fee (Default: ${DEFAULT_MIN_TRANSACTION_FEES.unvote})`
    )) || DEFAULT_MIN_TRANSACTION_FEES.unvote;
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
  const recipientAddress = await this.promptInput('Address of the recipient:');
  if (recipientAddress === '') throw new Error('You should provide an address');

  const amount = (
    parseInt(await this.promptInput('Amount of the transfer:')) * 100000000
  ).toString();
  if (typeof amount !== 'number') throw new Error('Invalid amount.');

  const fee =
    (await this.promptInput(
      `Fee (Default: ${DEFAULT_MIN_TRANSACTION_FEES.transfer})`
    )) || DEFAULT_MIN_TRANSACTION_FEES.transfer;
  const message =
    (await this.promptInput('Message to send of the recipient:')) || '';

  console.log(
    `Sending ${
      parseFloat(amount) / 100000000
    } token to ${recipientAddress} with a fee of ${fee}`
  );

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

// const verifyTransaction = async function (client) {
//   // TODO: Probably needs more inputs here
//   const transaction = await this.promptInput('Transaction:');

//   const verifiedTransaction = await client.verifiedTransaction(transaction);

//   this.successLog(verifiedTransaction, 'Transaction verified:');
// };

const registerMultisigWallet = async function (client) {
  const count = await this.promptInput('Count of memberAddresses to be added:');

  const memberAddresses = [];
  for (let i = 0; i < count; i++) {
    const address = await this.promptInput('Member address:');
    if (address === '') {
      this.errorLog('No address provided', null, true);
      i--;
      continue;
    }
    memberAddresses.push(address);
  }

  const requiredSignatureCount = await this.promptInput('Signature count:');
  const message = await this.promptInput('Message (optional):');
  const fee =
    (await this.promptInput(
      `Fee (Default: ${DEFAULT_MIN_TRANSACTION_FEES.registerMultisigWallet})`
    )) || DEFAULT_MIN_TRANSACTION_FEES.registerMultisigWallet;

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
  if (multisigPassphrase === '')
    throw new Error('You should provide a passphrase');

  const message = await this.promptInput('Message (optional):');
  const fee =
    (await this.promptInput(
      `Fee (Default: ${DEFAULT_MIN_TRANSACTION_FEES.registerMultisigDetails})`
    )) || DEFAULT_MIN_TRANSACTION_FEES.registerMultisigDetails;

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
  if (sigPassphrase === '') throw new Error('You should provide an passphrase');

  const message = await this.promptInput('Message (optional):');
  const fee =
    (await this.promptInput(
      `Fee (Default: (Default: ${DEFAULT_MIN_TRANSACTION_FEES.registerSigDetails})`
    )) || DEFAULT_MIN_TRANSACTION_FEES.registerSigDetails;

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
  if (forgingPassphrase === '')
    throw new Error('You should provide an passphrase');

  const message = await this.promptInput('Message (optional):');
  const fee =
    (await this.promptInput(
      `Fee (Default: ${DEFAULT_MIN_TRANSACTION_FEES.registerForgingDetails})`
    )) || DEFAULT_MIN_TRANSACTION_FEES.registerForgingDetails;

  const details = await client.prepareRegisterMultisigDetails({
    newNextForgingKeyIndex,
    forgingPassphrase,
    message,
    fee,
  });

  await client.postTransaction(details);

  this.successLog(details, 'Details registered:');
};

const pendingTransactions = async function (client) {
  const pendingTxnCount = await client.getPendingTransactionCount();
  this.successLog(pendingTxnCount, 'pending transaction count:');
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
  pendingTransactions,
  // verifyTransaction,
};

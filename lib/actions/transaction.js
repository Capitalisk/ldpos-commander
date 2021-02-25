const { _decimalsToInteger, _integerToDecimals } = require('../utils');

const transfer = async function (client) {
  const minFees = await client.getMinFees();

  const recipientAddress = await this.promptInput('Address of the recipient:');
  if (recipientAddress === '') throw new Error('You should provide an address');

  const amount = _decimalsToInteger(
    await this.promptInput('Amount of the transfer:')
  );
  if (typeof parseFloat(amount) !== 'number')
    throw new Error('Invalid amount.');

  const fee =
    _decimalsToInteger(
      await this.promptInput(
        `Fee (Default: ${_integerToDecimals(
          minFees.minTransactionFees.transfer
        )}):`
      )
    ) || minFees.minTransactionFees.transfer;

  const message =
    (await this.promptInput('Message to send of the recipient:')) || '';

  console.log(
    `Sending ${_integerToDecimals(
      amount
    )} token to ${recipientAddress} with a fee of ${_integerToDecimals(fee)}`
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
  const minFees = await client.getMinFees();

  const delegateAddress = await this.promptInput('Address of the delegate:');
  if (delegateAddress === '') throw new Error('You should provide an address');

  const validAddress = await client.getAccount(delegateAddress);
  if (!validAddress) throw new Error('Invalid address.');

  const fee =
    _decimalsToInteger(
      await this.promptInput(
        `Fee (Default: ${_integerToDecimals(minFees.minTransactionFees.vote)}):`
      )
    ) || minFees.minTransactionFees.vote;

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
  const minFees = await client.getMinFees();

  const delegateAddress = await this.promptInput('Address of the delegate:');
  if (delegateAddress === '') throw new Error('You should provide an address');

  const validAddress = await client.getAccount(delegateAddress);
  if (!validAddress) throw new Error('Invalid address.');

  const fee =
    _decimalsToInteger(
      await this.promptInput(
        `Fee (Default: ${_integerToDecimals(
          minFees.minTransactionFees.unvote
        )}):`
      )
    ) || minFees.minTransactionFees.unvote;

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
  const minFees = await client.getMinFees();

  const recipientAddress = await this.promptInput('Address of the recipient:');
  if (recipientAddress === '') throw new Error('You should provide an address');

  const amount = _decimalsToInteger(
    await this.promptInput('Amount of the transfer:')
  );
  if (typeof amount !== 'number') throw new Error('Invalid amount.');

  const fee =
    _decimalsToInteger(
      await this.promptInput(
        `Fee (Default: ${_integerToDecimals(
          minFees.minTransactionFees.transfer
        )}):`
      )
    ) || minFees.minTransactionFees.transfer;

  const message =
    (await this.promptInput('Message to send of the recipient:')) || '';

  console.log(
    `Sending ${_integerToDecimals(
      amount
    )} token to ${recipientAddress} with a fee of ${_integerToDecimals(fee)}`
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
// const minFees = await client.getMinFees();
//   // TODO: Probably needs more inputs here
//   const transaction = await this.promptInput('Transaction:');

//   const verifiedTransaction = await client.verifiedTransaction(transaction);

//   this.successLog(verifiedTransaction, 'Transaction verified:');
// };

const registerMultisigWallet = async function (client) {
  const minFees = await client.getMinFees();

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

  const requiredSignatureCount = parseInt(await this.promptInput('Signature count:'));
  const message = await this.promptInput('Message (optional):');

  const fee =
    _decimalsToInteger(
      await this.promptInput(
        `Fee (Default: ${_integerToDecimals(
          minFees.minTransactionFees.registerMultisigWallet
        )}):`
      )
    ) || minFees.minTransactionFees.registerMultisigWallet;

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
  const minFees = await client.getMinFees();

  const newNextMultisigKeyIndex = await this.promptInput(
    'newNextMultisigKeyIndex (Default: 0):'
  );

  const multisigPassphrase = await this.promptInput(
    'Multisig passphrase:'
  );
  if (multisigPassphrase === '')
    throw new Error('You should provide a passphrase');

  const message = await this.promptInput('Message (optional):');

  const fee =
    _decimalsToInteger(
      await this.promptInput(
        `Fee (Default: ${_integerToDecimals(
          minFees.minTransactionFees.registerMultisigDetails
        )}):`
      )
    ) || minFees.minTransactionFees.registerMultisigDetails;

  const details = await client.prepareRegisterMultisigDetails({
    newNextMultisigKeyIndex,
    multisigPassphrase,
    message,
    fee,
  });

  await client.postTransaction(details);

  details.fee = _integerToDecimals(details.fee)

  this.successLog(details, 'Details registered:');
};

const registerSigDetails = async function (client) {
  const minFees = await client.getMinFees();

  const newNextSigKeyIndex = await this.promptInput(
    'newNextSigKeyIndex (Default: 0):'
  );

  const sigPassphrase = await this.promptInput('Sig passphrase:');
  if (sigPassphrase === '') throw new Error('You should provide an passphrase');

  const message = await this.promptInput('Message (optional):');

  const fee =
    _decimalsToInteger(
      await this.promptInput(
        `Fee (Default: ${_integerToDecimals(
          minFees.minTransactionFees.registerSigDetails
        )}):`
      )
    ) || minFees.minTransactionFees.registerSigDetails;

  const details = await client.prepareRegisterSigDetails({
    newNextSigKeyIndex,
    sigPassphrase,
    message,
    fee,
  });

  await client.postTransaction(details);

  details.fee = _integerToDecimals(details.fee)

  this.successLog(details, 'Details registered:');
};

const registerForgingDetails = async function (client) {
  const minFees = await client.getMinFees();

  const newNextForgingKeyIndex = await this.promptInput(
    'newNextForgingKeyIndex (Default: 0):'
  );
  const forgingPassphrase = await this.promptInput(
    'Forging passphrase:'
  );
  if (forgingPassphrase === '')
    throw new Error('You should provide an passphrase');

  const message = await this.promptInput('Message (optional):');

  const fee =
    _decimalsToInteger(
      await this.promptInput(
        `Fee (Default: ${_integerToDecimals(
          minFees.minTransactionFees.registerForgingDetails
        )}):`
      )
    ) || minFees.minTransactionFees.registerForgingDetails;

  const details = await client.prepareRegisterForgingDetails({
    newNextForgingKeyIndex,
    forgingPassphrase,
    message,
    fee,
  });

  await client.postTransaction(details);

  details.fee = _integerToDecimals(details.fee)

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

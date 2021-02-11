const transfer = async (opts) => {
  // prettier-ignore
  const recipientAddress = await opts.promptInput('Address of the recipient:') || 'ldpos75fbb06210575fd8f7f62e0b9267d4386273fc80'
  // prettier-ignore
  const amount = await opts.promptInput('Amount of the transfer:') || `${Math.floor(Math.random() * 1)}000000000`
  // TODO: What should this be?
  // const fee = await opts.promptInput('Fee:')
  // prettier-ignore
  const message = await opts.promptInput('Message to send of the recipient:') || ''

  const preparedTxn = await opts.client.prepareTransaction({
    type: 'transfer',
    recipientAddress,
    amount,
    fee: `10000000`,
    timestamp: 100000,
    message,
  });

  await opts.client.postTransaction(preparedTxn);
  opts.successLog(
    `Transfer to wallet ${preparedTxn.recipientAddress} completed.`
  );
};

const vote = async (opts) => {
  // prettier-ignore
  const delegateAddress = await opts.promptInput('Address of the recipient:') || 'ldpos75fbb06210575fd8f7f62e0b9267d4386273fc80'
  const message =
    (await opts.promptInput('Message to send of the recipient:')) || '';

  const voteTxn = await opts.client.prepareTransaction({
    type: 'vote',
    delegateAddress,
    fee: `20000000`,
    timestamp: 200000,
    message,
  });

  await opts.client.postTransaction(voteTxn);
  opts.successLog(`Vote to delegate ${voteTxn.delegateAddress} succesfull.`);
};

const unvote = async (opts) => {
  // prettier-ignore
  const delegateAddress = await opts.promptInput('Address of the recipient:') || 'ldpos75fbb06210575fd8f7f62e0b9267d4386273fc80'
  const message =
    (await opts.promptInput('Message to send of the recipient:')) || '';

  const unvoteTxn = await opts.client.prepareTransaction({
    type: 'unvote',
    delegateAddress,
    fee: `20000000`,
    timestamp: 200000,
    message,
  });

  await opts.client.postTransaction(unvoteTxn);
  opts.successLog(
    `Unvote to delegate ${unvoteTxn.delegateAddress} succesfull.`
  );
};

const registerMultisigDetails = async (opts) => {
  // prettier-ignore
  const recipientAddress = await opts.promptInput('Address of the recipient:') || 'ldpos75fbb06210575fd8f7f62e0b9267d4386273fc80'
  // prettier-ignore
  const amount = await opts.promptInput('Amount of the transfer:') || `${Math.floor(Math.random() * 1)}000000000`
  // TODO: What should this be?
  // const fee = await opts.promptInput('Fee:')
  // prettier-ignore
  const message = await opts.promptInput('Message to send of the recipient:') || ''

  const preparedMultisigTxn = await opts.client.prepareMultisigTransaction({
    type: 'transfer',
    recipientAddress,
    amount,
    fee: `10000000`,
    timestamp: 100000,
    message,
  });

  const multisigTxnSignature = await opts.client.signMultisigTransaction(
    preparedMultisigTxn
  );
  console.log('Multisig transaction signature:', multisigTxnSignature);
};

module.exports = {
  transfer,
  vote,
  unvote,
  // registerMultisigWallet,
  // registerSigDetails,
  registerMultisigDetails,
  // registerForgingDetails,
};

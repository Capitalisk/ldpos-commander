const transfer = async ({ promptInput, client, successLog, config }) => {
  // prettier-ignore
  const recipientAddress = await promptInput('Address of the recipient:') || 'ldpos75fbb06210575fd8f7f62e0b9267d4386273fc80'
  // prettier-ignore
  const amount = await promptInput('Amount of the transfer:') || `${Math.floor(Math.random() * 1)}000000000`
  // TODO: What should this be?
  // const fee = await promptInput('Fee:')
  // prettier-ignore
  const message = await promptInput('Message to send of the recipient:') || ''

  const preparedTxn = await client.prepareTransaction({
    type: 'transfer',
    recipientAddress,
    amount,
    fee: `10000000`,
    timestamp: 100000,
    message,
  });

  await client.postTransaction(preparedTxn);
  `Transfer to wallet ${preparedTxn.recipientAddress} completed.`,
    successLog(config.interactive);
};

const vote = async ({ promptInput, client, successLog, config }) => {
  // prettier-ignore
  const delegateAddress = await promptInput('Address of the recipient:') || 'ldpos75fbb06210575fd8f7f62e0b9267d4386273fc80'
  const message =
    (await promptInput('Message to send of the recipient:')) || '';

  const voteTxn = await client.prepareTransaction({
    type: 'vote',
    delegateAddress,
    fee: `20000000`,
    timestamp: 200000,
    message,
  });

  await client.postTransaction(voteTxn);
  successLog(
    voteTxn.delegateAddress,
    `Vote to delegate successfull:`,
    config.interactive
  );
};

const unvote = async ({ promptInput, client, successLog, config }) => {
  // prettier-ignore
  const delegateAddress = await promptInput('Address of the recipient:') || 'ldpos75fbb06210575fd8f7f62e0b9267d4386273fc80'
  const message =
    (await promptInput('Message to send of the recipient:')) || '';

  const unvoteTxn = await client.prepareTransaction({
    type: 'unvote',
    delegateAddress,
    fee: `20000000`,
    timestamp: 200000,
    message,
  });

  await client.postTransaction(unvoteTxn);
  successLog(
    unvoteTxn.delegateAddress,
    `Unvote to delegate successfull:`,
    config.interactive
  );
};

const multisignTransfer = async ({
  promptInput,
  client,
  successLog,
  config,
}) => {
  // prettier-ignore
  const recipientAddress = await promptInput('Address of the recipient:') || 'ldpos75fbb06210575fd8f7f62e0b9267d4386273fc80'
  // prettier-ignore
  const amount = await promptInput('Amount of the transfer:') || `${Math.floor(Math.random() * 1)}000000000`
  // TODO: What should this be?
  // const fee = await promptInput('Fee:')
  // prettier-ignore
  const message = await promptInput('Message to send of the recipient:') || ''

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
  successLog(
    multisigTxnSignature,
    'Multisig transaction signature:',
    config.interactive
  );
};

const verifyTransaction = async ({
  promptInput,
  client,
  successLog,
  config,
}) => {
  // TODO: Probably needs more inputs here
  const transaction = await promptInput('Transaction:');

  const verifiedTransaction = await client.verifiedTransaction(transaction);

  successLog(verifiedTransaction, 'Transaction verified:', config.interactive);
};

module.exports = {
  transfer,
  vote,
  unvote,
  // registerMultisigWallet,
  // registerSigDetails,
  multisignTransfer,
  // registerForgingDetails,
  verifyTransaction,
};

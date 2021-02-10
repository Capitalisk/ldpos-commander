const { promptInput, successLog } = require('..');

const transfer = async ({ client, promptInput }) => {
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
  successLog(`Transfer to wallet ${preparedTxn.recipientAddress} completed.`);
};

const vote = async ({ client, promptInput }) => {
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
  successLog(`Vote to delegate ${voteTxn.delegateAddress} succesfull.`);
};

const unvote = async ({ client, promptInput }) => {
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
  successLog(`Unvote to delegate ${unvoteTxn.delegateAddress} succesfull.`);
};

const registerMultisigDetails = async ({ client, promptInput }) => {
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

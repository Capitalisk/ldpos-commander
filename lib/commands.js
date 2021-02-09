const { promptInput, successLog } = require('.');

const transfer = async ({ client, passphrase }) => {
  console.log('transfer', passphrase);

  const recipientAddress =
    (await promptInput('Address of the recipient:')) ||
    'ldpos75fbb06210575fd8f7f62e0b9267d4386273fc80';
  const amount =
    (await promptInput('Amount of the transfer:')) ||
    `${Math.floor(Math.random() * 1)}000000000`;
  // TODO: What should this be?
  // const fee = await promptInput('Fee:')
  const message =
    (await promptInput('Message to send of the recipient:')) || '';

  for (let i = 0; i < 1; i++) {
    let preparedTxn = await client.prepareTransaction({
      type: 'transfer',
      recipientAddress,
      amount,
      fee: `10000000`,
      timestamp: 100000,
      message,
    });

    await client.postTransaction(preparedTxn);
    successLog(
      `Transaction to wallet ${preparedTxn.recipientAddress} completed.`
    );
  }
};

module.exports = {
  transfer,
};

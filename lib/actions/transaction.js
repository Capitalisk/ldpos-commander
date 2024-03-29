const fs = require('fs-extra');
const {
  _decimalToInteger,
  _integerToDecimal,
  _checkDirectoryConfig,
  _parseJsonFile,
} = require('../utils');

const transfer = async function (client) {
  if (!client.passphrase)
    throw new Error('You should run the login command first');

  const minFees = await client.getMinFees();

  const recipientAddress = await this.promptInput('Address of the recipient:');
  if (recipientAddress === '') throw new Error('You should provide an address');

  const amount = _decimalToInteger(
    await this.promptInput('Amount of the transfer:')
  );
  if (typeof parseFloat(amount) !== 'number')
    throw new Error('Invalid amount.');

  const fee =
    _decimalToInteger(
      await this.promptInput(
        `Fee (Default: ${_integerToDecimal(
          minFees.minTransactionFees.transfer
        )}):`
      )
    ) || minFees.minTransactionFees.transfer;

  const message =
    (await this.promptInput('Transaction message:')) || '';

  console.log(
    `Sending ${_integerToDecimal(
      amount
    )} token to ${recipientAddress} with a fee of ${_integerToDecimal(fee)}`
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
  if (!client.passphrase)
    throw new Error('You should run the login command first');

  const minFees = await client.getMinFees();

  const delegateAddress = await this.promptInput('Address of the delegate:');
  if (delegateAddress === '') throw new Error('You should provide an address');

  const validAddress = await client.getAccount(delegateAddress);
  if (!validAddress) throw new Error('Invalid address.');

  const fee =
    _decimalToInteger(
      await this.promptInput(
        `Fee (Default: ${_integerToDecimal(minFees.minTransactionFees.vote)}):`
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
  this.successLog(voteTxn.delegateAddress, 'Posted vote transaction:');
};

const unvote = async function (client) {
  if (!client.passphrase)
    throw new Error('You should run the login command first');

  const minFees = await client.getMinFees();

  const delegateAddress = await this.promptInput('Address of the delegate:');
  if (delegateAddress === '') throw new Error('You should provide an address');

  const validAddress = await client.getAccount(delegateAddress);
  if (!validAddress) throw new Error('Invalid address.');

  const fee =
    _decimalToInteger(
      await this.promptInput(
        `Fee (Default: ${_integerToDecimal(
          minFees.minTransactionFees.unvote
        )}):`
      )
    ) || minFees.minTransactionFees.unvote;

  const message =
    (await this.promptInput('Transaction message:')) || '';

  const unvoteTxn = await client.prepareTransaction({
    type: 'unvote',
    delegateAddress,
    fee,
    timestamp: Date.now(),
    message,
  });

  await client.postTransaction(unvoteTxn);
  this.successLog(unvoteTxn.delegateAddress, `Posted unvote transaction:`);
};

const createMultisigTransfer = async function (client) {
  if (!client.passphrase)
    throw new Error('You should run the login command first');

  const minFees = await client.getMinFees();

  const recipientAddress = await this.promptInput('Address of the recipient:');
  if (recipientAddress === '') throw new Error('You should provide an address');

  const amount = _decimalToInteger(
    await this.promptInput('Amount of the transfer:')
  );
  if (typeof parseFloat(amount) !== 'number')
    throw new Error('Invalid amount.');

  let fee =
    _decimalToInteger(
      await this.promptInput(
        `Fee (Default: ${_integerToDecimal(
          minFees.minTransactionFees.transfer
        )}):`
      )
    ) || minFees.minTransactionFees.transfer;

  const message =
    (await this.promptInput('Transaction message:')) || '';

  console.log(
    `Sending ${_integerToDecimal(
      amount
    )} token to ${recipientAddress} with a fee of ${_integerToDecimal(fee)}`
  );

  const address = await client.getWalletAddress();

  const members = [...(await client.getMultisigWalletMembers(address))];

  const memberFees =
    minFees.minMultisigTransactionFeePerMember * members.length;

  fee && (fee = (parseInt(fee) + memberFees).toString());

  const preparedMultisigTxn = await client.prepareMultisigTransaction({
    type: 'transfer',
    recipientAddress,
    amount,
    fee,
    timestamp: Date.now(),
    message,
  });

  const txnInJson = JSON.stringify(preparedMultisigTxn);
  console.log('Copy the below object\n\n');

  console.log(txnInJson, '\n');
};

const signMultisigTransfer = async function (client) {
  if (!client.passphrase)
    throw new Error('You should run the login command first');

  const preparedMultisigTxn = JSON.parse(
    await this.promptInput('JSON Object to sign:')
  );

  const multisigTxnSignature = await client.signMultisigTransaction(
    preparedMultisigTxn
  );

  const signaturePath = await _checkDirectoryConfig.call(this);

  const absolutePath = `${signaturePath}/signature_${preparedMultisigTxn.id}_${multisigTxnSignature.signerAddress}.json`;

  await fs.outputFile(absolutePath, JSON.stringify(multisigTxnSignature));

  this.successLog(`File written in ${absolutePath}`);
};

const postMultisigTransaction = async function (client) {
  if (!client.passphrase)
    throw new Error('You should run the login command first');

  const preparedTxn = JSON.parse(
    await this.promptInput('JSON Object to post:')
  );

  if (
    ((await this.promptInput(
      'Use dir as path to signatures (Y/n) (Default: Y):'
    )) || 'Y') === 'Y'
  ) {
    const dirPrompt = async () => {
      const signaturePath = await _checkDirectoryConfig.call(this);

      try {
        let files = await fs.readdir(signaturePath);

        const exp = new RegExp('^signature.*' + preparedTxn.id + '*.');

        for (let i = 0; i < files.length; i++) {
          const file = files[i];

          if (exp.test(file)) {
            preparedTxn.signatures.push(
              await _parseJsonFile(`${signaturePath}/${file}`)
            );
          }
        }
      } catch (e) {
        this.errorLog('Invalid directory', null, true);
        await dirPrompt();
      }
    };

    await dirPrompt();
  } else {
    const count = await this.promptInput(
      'Count of signature files to be added:'
    );

    for (let i = 0; i < count; i++) {
      const fileLocation = await this.promptInput('File location:');

      if (fileLocation === '') {
        this.errorLog('No file location provided', null, true);
        i--;
        continue;
      }

      preparedTxn.signatures.push(await _parseJsonFile(fileLocation));
    }
  }

  await client.postTransaction(preparedTxn);

  delete preparedTxn.signatures;

  preparedTxn.amount &&
    (preparedTxn.amount = _integerToDecimal(preparedTxn.amount));

  preparedTxn.fee && (preparedTxn.fee = _integerToDecimal(preparedTxn.fee));

  this.successLog(preparedTxn, 'Posted transaction:');
};

const registerMultisigWallet = async function (client) {
  if (!client.passphrase)
    throw new Error('You should run the login command first');

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

  const requiredSignatureCount = parseInt(
    await this.promptInput('Required signature count:')
  );
  const message = await this.promptInput('Message (optional):');

  const memberFees =
    minFees.minMultisigRegistrationFeePerMember * memberAddresses.length;

  const totalFees = (
    parseInt(minFees.minTransactionFees.registerMultisigWallet) + memberFees
  ).toString();

  const fee =
    _decimalToInteger(
      await this.promptInput(`Fee (Default: ${_integerToDecimal(totalFees)}):`)
    ) || totalFees;

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
  if (!client.passphrase)
    throw new Error('You should run the login command first');

  const minFees = await client.getMinFees();

  let newNextMultisigKeyIndex = await this.promptInput(
    'newNextMultisigKeyIndex (Default: 0):'
  );

  if (newNextMultisigKeyIndex != null)
    newNextMultisigKeyIndex = parseInt(newNextMultisigKeyIndex);

  const multisigPassphrase = await this.promptInput(
    'Multisig passphrase:',
    true
  );
  if (multisigPassphrase === '')
    throw new Error('You should provide a passphrase');

  const message = await this.promptInput('Message (optional):');

  const fee =
    _decimalToInteger(
      await this.promptInput(
        `Fee (Default: ${_integerToDecimal(
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

  details.fee = _integerToDecimal(details.fee);
  delete details.senderSignature;

  this.successLog(details, 'Details registered:');
};

const registerSigDetails = async function (client) {
  if (!client.passphrase)
    throw new Error('You should run the login command first');

  const minFees = await client.getMinFees();

  let newNextSigKeyIndex = await this.promptInput(
    'newNextSigKeyIndex (Default: 0):'
  );

  if (newNextSigKeyIndex != null)
    newNextSigKeyIndex = parseInt(newNextSigKeyIndex);

  const sigPassphrase = await this.promptInput('Sig passphrase:', true);
  if (sigPassphrase === '') throw new Error('You should provide a passphrase');

  const message = await this.promptInput('Message (optional):');

  const fee =
    _decimalToInteger(
      await this.promptInput(
        `Fee (Default: ${_integerToDecimal(
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

  details.fee = _integerToDecimal(details.fee);
  delete details.senderSignature;

  this.successLog(details, 'Details registered:');
};

const registerForgingDetails = async function (client) {
  if (!client.passphrase)
    throw new Error('You should run the login command first');

  const minFees = await client.getMinFees();

  let newNextForgingKeyIndex = await this.promptInput(
    'newNextForgingKeyIndex (Default: 0):'
  );
  if (newNextForgingKeyIndex != null)
    newNextForgingKeyIndex = parseInt(newNextForgingKeyIndex);

  const forgingPassphrase = await this.promptInput('Forging passphrase:', true);
  if (forgingPassphrase === '')
    throw new Error('You should provide a passphrase');

  const message = await this.promptInput('Message (optional):');

  const fee =
    _decimalToInteger(
      await this.promptInput(
        `Fee (Default: ${_integerToDecimal(
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

  details.fee = _integerToDecimal(details.fee);
  delete details.senderSignature;

  this.successLog(details, 'Details registered:');
};

const pendingTransactions = async function (client) {
  const pendingTxnCount = await client.getPendingTransactionCount();
  this.successLog(pendingTxnCount, 'pending transaction count:');
};

const listTransactions = async function (
  client,
  pageInfo = { offset: 0, limit: 1, pageNumber: 1, order: 'desc' }
) {
  let transactions = await client.getTransactionsByTimestamp(
    pageInfo.offset,
    pageInfo.limit,
    pageInfo.pageInfo
  );

  for (let i = 0; i < transactions.length; i++) {
    const t = transactions[i];
    if (t.amount) transactions[i].amount = _integerToDecimal(t.amount);
    if (t.fee) transactions[i].fee = _integerToDecimal(t.fee);
  }

  await this.pagination(transactions, pageInfo, 1, listTransactions, [
    client,
    pageInfo,
  ]);
};

module.exports = {
  transfer,
  vote,
  unvote,
  registerMultisigWallet,
  registerMultisigDetails,
  registerSigDetails,
  postMultisigTransaction,
  registerForgingDetails,
  pendingTransactions,
  signMultisigTransfer,
  createMultisigTransfer,
  listTransactions,
};

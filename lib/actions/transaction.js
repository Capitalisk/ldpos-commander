const fs = require('fs-extra');
const {
  _decimalToInteger,
  _integerToDecimal,
  _checkDirectoryConfig,
} = require('../utils');

const transfer = async function (client) {
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
    (await this.promptInput('Message to send of the recipient:')) || '';

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
  this.successLog(voteTxn.delegateAddress, `Vote to delegate successfull:`);
};

const unvote = async function (client) {
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

const createMultisigTransfer = async function (client) {
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
    (await this.promptInput('Message to send of the recipient:')) || '';

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

const postMultisigTransfer = async function (client) {
  const minFees = await client.getMinFees();

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
            preparedTxn.signatures.push(require(`${signaturePath}/${file}`));
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

      preparedTxn.signatures.push(require(fileLocation));
    }
  }

  await client.postTransaction(preparedTxn);

  delete preparedTxn.signatures;

  preparedTxn.amount &&
    (preparedTxn.amount = _integerToDecimal(preparedTxn.amount));

  preparedTxn.fee && (preparedTxn.fee = _integerToDecimal(preparedTxn.fee));

  this.successLog(preparedTxn, 'Successful transaction:');
};

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

  const requiredSignatureCount = parseInt(
    await this.promptInput('Signature count:')
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
  const minFees = await client.getMinFees();

  const newNextMultisigKeyIndex = await this.promptInput(
    'newNextMultisigKeyIndex (Default: 0):'
  );

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
  const minFees = await client.getMinFees();

  const newNextSigKeyIndex = await this.promptInput(
    'newNextSigKeyIndex (Default: 0):'
  );

  const sigPassphrase = await this.promptInput('Sig passphrase:', true);
  if (sigPassphrase === '') throw new Error('You should provide an passphrase');

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
  const minFees = await client.getMinFees();

  const newNextForgingKeyIndex = await this.promptInput(
    'newNextForgingKeyIndex (Default: 0):'
  );
  const forgingPassphrase = await this.promptInput('Forging passphrase:', true);
  if (forgingPassphrase === '')
    throw new Error('You should provide an passphrase');

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

module.exports = {
  transfer,
  vote,
  unvote,
  registerMultisigWallet,
  registerMultisigDetails,
  registerSigDetails,
  postMultisigTransfer,
  registerForgingDetails,
  pendingTransactions,
  signMultisigTransfer,
  createMultisigTransfer,
};

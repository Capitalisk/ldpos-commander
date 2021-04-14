const { _integerToDecimal, _transformMonetaryArrayUnits } = require('../utils');

const listAccountsByBalance = async function (
  client,
  pageInfo = { offset: 0, limit: 1, pageNumber: 1, order: 'asc' }
) {
  let accounts = await client.getAccountsByBalance(
    pageInfo.offset,
    pageInfo.limit,
    pageInfo.pageInfo
  );

  accounts = await _transformMonetaryArrayUnits(accounts);

  await this.pagination(accounts, pageInfo, 1, listAccountsByBalance, [
    client,
    pageInfo,
  ]);
};

const listMultisigWalletMembers = async function (client) {
  const wallet = await this.promptInput('Wallet address:');
  const account = await client.getMultisigWalletMembers(wallet);

  this.successLog(account, 'Found members:');
};

const listOutboundTransactions = async function (
  client,
  pageInfo = {
    offset: 0,
    limit: 1,
    pageNumber: 1,
    order: 'asc',
  },
  wallet = null
) {
  const commandIsWallet = this.argv._[0] === 'wallet';

  if (commandIsWallet) wallet = client.getWalletAddress();

  if (commandIsWallet) {
    if (!client.passphrase) {
      throw new Error('You should run the login command first');
    }
  } else if (!wallet) wallet = await this.promptInput('Wallet address:');

  let transactions = await client.getOutboundTransactions(
    wallet,
    null,
    pageInfo.offset,
    pageInfo.limit,
    pageInfo.order
  );

  transactions = await _transformMonetaryArrayUnits(transactions);

  await this.pagination(transactions, pageInfo, 1, listOutboundTransactions, [
    client,
    pageInfo,
    wallet,
  ]);
};

const listInboundTransactions = async function (
  client,
  pageInfo = {
    offset: 0,
    limit: 1,
    pageNumber: 1,
    order: 'asc',
    dateModify: false,
  },
  wallet = null
) {
  const commandIsWallet = this.argv._[0] === 'wallet';

  if (commandIsWallet) wallet = client.getWalletAddress();

  if (commandIsWallet) {
    if (!client.passphrase) {
      throw new Error('You should run the login command first');
    }
  } else if (!wallet) wallet = await this.promptInput('Wallet address:');

  let transactions = await client.getInboundTransactions(
    wallet,
    null,
    pageInfo.offset,
    pageInfo.limit,
    pageInfo.order
  );

  transactions = await _transformMonetaryArrayUnits(transactions);

  await this.pagination(transactions, pageInfo, 1, listInboundTransactions, [
    client,
    pageInfo,
    wallet,
  ]);
};

const votes = async function (client) {
  let wallet;

  const commandIsWallet = this.argv._[0] === 'wallet';

  if (commandIsWallet) wallet = client.getWalletAddress();
  else if (!wallet) wallet = await this.promptInput('Wallet address:');

  const accountVotes = await client.getAccountVotes(wallet);
  this.successLog(accountVotes, 'account votes:');
};

const listPendingOutboundTransactions = async function (
  client,
  pageInfo = { offset: 0, limit: 1, pageNumber: 1, order: 'asc' },
  wallet = null
) {
  const commandIsWallet = this.argv._[0] === 'wallet';

  if (commandIsWallet) wallet = client.getWalletAddress();

  if (commandIsWallet) {
    if (!client.passphrase) {
      throw new Error('You should run the login command first');
    }
  } else if (!wallet) wallet = await this.promptInput('Wallet address:');

  let transactions = await client.getOutboundPendingTransactions(
    wallet,
    pageInfo.offset,
    pageInfo.limit
  );

  for (let i = 0; i < transactions.length; i++) {
    const t = transactions[i];
    if (t.amount)
      transactions[i].amount = _integerToDecimal(transaction.amount);
    if (t.fee) transactions[i].fee = _integerToDecimal(transaction.fee);
  }

  await this.pagination(
    transactions,
    pageInfo,
    1,
    listPendingOutboundTransactions,
    [client, pageInfo]
  );
};

module.exports = {
  listOutboundTransactions,
  listInboundTransactions,
  votes,
  listPendingOutboundTransactions,
  listAccountsByBalance,
  listMultisigWalletMembers,
};

const { _integerToDecimal } = require('../utils');

const outboundTransactions = async function (
  client,
  pageInfo = { offset: 0, limit: 1, pageNumber: 1, order: 'desc' }
) {
  if (!client.passphrase) throw new Error('You should run the login command first')

  let txns = await client.getOutboundTransactions(
    client.getWalletAddress(),
    pageInfo.offset,
    pageInfo.limit,
    pageInfo.order
  );

  txns = txns.map((transaction) => {
    transaction.amount &&
      (transaction.amount = _integerToDecimal(transaction.amount));
    transaction.fee && (transaction.fee = _integerToDecimal(transaction.fee));

    return transaction;
  });

  await this.pagination(txns, pageInfo, 1, outboundTransactions, [client, pageInfo]);
};

const inboundTransactions = async function (
  client,
  pageInfo = { offset: 0, limit: 1, pageNumber: 1, order: 'desc' }
) {
  if (!client.passphrase) throw new Error('You should run the login command first')

  let txns = await client.getInboundTransactions(
    client.getWalletAddress(),
    pageInfo.offset,
    pageInfo.limit,
    pageInfo.order
  );

  txns = txns.map((transaction) => {
    transaction.amount &&
      (transaction.amount = _integerToDecimal(transaction.amount));
    transaction.fee && (transaction.fee = _integerToDecimal(transaction.fee));

    return transaction;
  });

  await this.pagination(txns, pageInfo, 1, inboundTransactions, [client, pageInfo]);
};

const votes = async function (client) {
  const accountVotes = await client.getAccountVotes(client.walletAddress);
  this.successLog(accountVotes, 'account votes:');
};

const listPendingOutboundTransactions = async function (
  client,
  pageInfo = { offset: 0, limit: 1, pageNumber: 1, order: 'asc' }
) {
  if (!client.passphrase) throw new Error('You should run the login command first')

  let transactions = await client.getOutboundPendingTransactions(
    client.getWalletAddress(),
    pageInfo.offset,
    pageInfo.limit
  );

  transactions = transactions.map((account) => ({
    ...account,
    balance: _integerToDecimal(account.balance),
  }));

  await this.pagination(
    transactions,
    pageInfo,
    1,
    listPendingOutboundTransactions,
    [client, pageInfo]
  );
};

const listPendingInboundTransactions = async function (
  client,
  pageInfo = { offset: 0, limit: 1, pageNumber: 1, order: 'asc' }
) {
  if (!client.passphrase) throw new Error('You should run the login command first')

  let transactions = await client.getInboundPendingTransactions(
    client.getWalletAddress(),
    pageInfo.offset,
    pageInfo.limit
  );

  transactions = transactions.map((account) => ({
    ...account,
    balance: _integerToDecimal(account.balance),
  }));

  await this.pagination(
    transactions,
    pageInfo,
    1,
    listPendingInboundTransactions,
    [client, pageInfo]
  );
};

module.exports = {
  outboundTransactions,
  inboundTransactions,
  votes,
  listPendingInboundTransactions,
  listPendingOutboundTransactions,
};

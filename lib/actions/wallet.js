const { _integerToDecimal } = require('../utils');

const transactions = async function (
  client,
  pageInfo = { offset: 0, limit: 1, pageNumber: 1, order: 'desc' }
) {
  let txns = await client.getTransactionsByTimestamp(
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

  await this.pagination(txns, pageInfo, 1, transactions, [client, pageInfo]);
};

const votes = async function (client) {
  const accountVotes = await client.getAccountVotes(client.walletAddress);
  this.successLog(accountVotes, 'account votes:');
};

module.exports = {
  transactions,
  votes,
};

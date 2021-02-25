const { _integerToDecimal } = require('../utils');

const listForgingDelegates = async function (client) {
  let delegates = await client.getForgingDelegates();

  delegates = delegates.map((delegate) => ({
    ...delegate,
    voteWeight: _integerToDecimal(delegate.voteWeight),
  }));

  this.successLog(delegates, 'forging delegates:');
};

const listDelegatesByVoteWeight = async function (
  client,
  pageInfo = { offset: 1, limit: 1, pageNumber: 1, order: 'asc' }
) {
  let delegates = await client.getDelegatesByVoteWeight(
    pageInfo.offset,
    pageInfo.limit,
    pageInfo.order
  );

  delegates = delegates.map((delegate) => ({
    ...delegate,
    voteWeight: _integerToDecimal(delegate.voteWeight),
  }));

  await this.pagination(delegates, pageInfo, 1, listDelegatesByVoteWeight, [
    client,
    pageInfo,
  ]);
};

module.exports = {
  listForgingDelegates,
  listDelegatesByVoteWeight,
};

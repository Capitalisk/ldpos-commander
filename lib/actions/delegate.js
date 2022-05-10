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
  pageInfo = { offset: 0, limit: 1, pageNumber: 1, order: 'desc' }
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

const delegateForging = async function (client, address) {
  const DELEGATE_ACTIVITY_ROUNDS = 3;

  const maxBlockHeight = await client.getMaxBlockHeight();
  const delegateCount = (await client.getForgingDelegates()).length;
  const slotCount = delegateCount * DELEGATE_ACTIVITY_ROUNDS;

  const latestBlocks = await client.getBlocksBetweenHeights(
    Math.max(0, maxBlockHeight - slotCount),
    maxBlockHeight,
    slotCount
  );

  const recentForgers = new Set(
    latestBlocks.map((block) => block.forgerAddress)
  );

  if (recentForgers.has(address)) {
    this.successLog(address, 'Delegate is forging: ');
  } else {
    this.errorLog('Delegate is not forging');
  }
};

module.exports = {
  listForgingDelegates,
  listDelegatesByVoteWeight,
  delegateForging,
};

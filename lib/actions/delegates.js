const listForgingDelegates = async function (client) {
  const delegates = await client.getForgingDelegates();
  this.successLog(delegates, 'forging delegates:');
};

const listDelegatesByVoteWeight = async function (
  client,
  pageInfo = { offset: 1, limit: 1, pageNumber: 1, order: 'asc' }
) {
  const delegates = await client.getDelegatesByVoteWeight(
    pageInfo.offset,
    pageInfo.limit,
    pageInfo.order
  );

  await this.pagination(delegates, pageInfo, 1, listDelegatesByVoteWeight, [
    client,
    pageInfo,
  ]);
};

module.exports = {
  listForgingDelegates,
  listDelegatesByVoteWeight,
};

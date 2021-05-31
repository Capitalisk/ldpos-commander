const listBlocksByTimestamp = async function (
  client,
  pageInfo = { offset: 0, limit: 1, pageNumber: 1, order: 'desc' }
) {
  let blocks = await client.getBlocksByTimestamp(
    pageInfo.offset,
    pageInfo.limit,
    pageInfo.order
  );

  // blocks = blocks.map((block) => ({
  //   ...block,
  //   voteWeight: _integerToDecimal(block.voteWeight),
  // }));

  await this.pagination(blocks, pageInfo, 1, listBlocksByTimestamp, [
    client,
    pageInfo,
  ]);
};

module.exports = {
  listBlocksByTimestamp,
};

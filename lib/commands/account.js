const balance = async ({ client }) => {
  const accounts = await client.getAccountsByBalance(0, 100);
  console.log('ACCOUNTS:', accounts);
};

const transactions = async ({ client }) => {
  let transactions = await client.getTransactionsByTimestamp(0, 100);
  console.log('TRANSACTIONS:', transactions);
};

module.exports = {
  balance,
  transactions,
};

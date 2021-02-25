const _decimalsToInteger = (amount) =>
  amount !== '' && (parseFloat(amount) * 100000000).toString();

const _integerToDecimals = (amount) =>
  amount !== '' && (parseInt(amount) / 100000000).toString();

module.exports = {
  _decimalsToInteger,
  _integerToDecimals,
};

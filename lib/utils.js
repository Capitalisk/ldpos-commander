const _decimalToInteger = (amount) =>
  amount !== '' && (parseFloat(amount) * 100000000).toString();

const _integerToDecimal = (amount) =>
  amount !== '' && (parseInt(amount) / 100000000).toString();

module.exports = {
  _decimalToInteger,
  _integerToDecimal,
};

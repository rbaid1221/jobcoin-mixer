const crypto = require('crypto');
const config = require('./config/config');

const generateDepositAddress = () => {
  const hash = crypto.createHash('sha256');
  return hash
    .update(`${Date.now()}`)
    .digest('hex')
    .substring(0, 8);
};

const separateAddressesToArray = (addresses) => {
  const splitAddresses = addresses.trim().split(',');
  return splitAddresses.filter((item) => item !== '');
};

const convertToFloat = (amount) => parseFloat(parseFloat(amount).toFixed(config.decimalPlaces));
/*
  Challenge Said to 'possibly' deduct a fee. So basing my fee deduction based
  on the total amount. The higher the amount, the less the % deducted.
  But really, ideally this would be based on the type of customer.
  For example if a 'Heavy Usage/Premium' customer should likely
  be less of a fee or no fee at all.
*/
const feePercentage = (amount) => {
  if (amount > 10000) {
    return 2;
  }
  if (amount > 5000) {
    return 4;
  }
  return 5;
};

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

module.exports = {
  generateDepositAddress,
  separateAddressesToArray,
  feePercentage,
  convertToFloat,
  getRandomInt,
};

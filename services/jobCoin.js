const axios = require('axios').default;
const config = require('../common/config/config');
const logger = require('../common/logger');
const utils = require('../common/utils');

/* Urls */
const API_BASE_URL = config.apis.jobClient.apiBaseUrl;
const API_ADDRESS_URL = `${API_BASE_URL}/addresses/`;
const API_TRANSACTIONS_URL = `${API_BASE_URL}/transactions`;

const getAddressInformation = (address) => axios.get(`${API_ADDRESS_URL}${address}`);

const isAddressUnused = async (address) => {
  // Only used by isAddressUnused, hence inner function. Makes for cleaner code in JS.
  const isEmpty = (info) => utils.convertToFloat(info.balance) === utils.convertToFloat(0) && info.transactions.length === 0;
  try {
    const addressInfo = await getAddressInformation(address);
    return isEmpty(addressInfo.data);
  } catch (error) { // @TODO: Handle retry mechanism. We know this should never return an error
    // according to API so if error means their service was down and retry properly
    logger.error(`There was an error with getting address information for address: ${address} with error status: ${error.response.status} data: ${error.response.data}`);
  }
  return false;
};

const getAddressBalance = async (address) => {
  try {
    const addressInfo = await getAddressInformation(address);
    return addressInfo.data.balance;
  } catch (error) { // @TODO: Handle retry mechanism. We know this should never return an error
    // according to API so if error means their service was down and retry properly
    logger.error(`There was an error with getting address information for address: ${address} with error status: ${error.response.status} data: ${error.response.data}`);
  }
  return null;
};

const sendTransaction = async (fromAddress, toAddress, amount) => {
  const body = {
    fromAddress,
    toAddress,
    amount,
  };
  try {
    await axios.post(API_TRANSACTIONS_URL, body);
  } catch (error) {
    logger.error(`There was an error with sending transaction from address: ${fromAddress} to addreess: ${toAddress} for amount: ${amount} with error status: ${error.response.status} data: ${error.response.data}`);
    return false;
  }
  return true;
};

module.exports = {
  isAddressUnused,
  API_ADDRESS_URL,
  API_TRANSACTIONS_URL,
  sendTransaction,
  getAddressBalance,
};

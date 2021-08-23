const logger = require('./logger');
const utils = require('./utils');
const jobClientApi = require('../services/jobCoin');
// Regex type validators will go in this file for quick validations
const isValidCommaSeparated = (input) => {
  const pattern = /(\d+)(,\s*\d+)*/;
  return pattern.test(input);
};

const validateInput = async (addresses) => {
  logger.info(`Generating separate addresses for input: ${addresses}`);
  const separatedAddresses = utils.separateAddressesToArray(addresses.trim());
  let promiseChecks = [];
  for (let i = 0; i < separatedAddresses.length; i += 1) {
    promiseChecks.push(jobClientApi.isAddressUnused(separatedAddresses[i]));
  }
  promiseChecks = await Promise.all(promiseChecks);
  const alreadyUsedAddresses = [];
  promiseChecks.forEach((validationResult, index) => {
    if (!validationResult) {
      alreadyUsedAddresses.push(separatedAddresses[index]);
    }
  });
  if (alreadyUsedAddresses.length > 0) {
    logger.info(`Some addressess from original input: ${addresses} were already used. Throwing an error`);
    throw new Error(`Not all addresses are unused. Used Addresses Present: ${alreadyUsedAddresses}`);
  }
  return true;
};

const validateAddresses = async (input) => {
  // @TODO: Get clarity. Is one deposit address enough? Currently only
  // allowing multiple based on understanding of documentation.
  if (!isValidCommaSeparated(input)) {
    return 'You supplied an empty or non-valid comma separated address. Please enter a valid comma separated list of addresses';
  }
  try {
    await validateInput(input.trim());
  } catch (ex) {
    return ex && ex.message ? ex.message : '';
  }
  return true;
};

module.exports = {
  validateAddresses,
  isValidCommaSeparated,
};

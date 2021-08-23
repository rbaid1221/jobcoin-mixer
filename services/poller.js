const retry = require('async-retry');
const config = require('../common/config/config');
const logger = require('../common/logger');
const jobApiClient = require('./jobCoin');

const throwIfUnused = async (address) => {
  logger.info(`Polling to see if address: ${address} is unused`);
  const isUnused = await jobApiClient.isAddressUnused(address);
  if (isUnused) {
    throw Error('Still unused');
  }
};

// @TODO: Should poller keep running, or exit after initial finding of balance? + replace all to cb's
// In a traditional sense, I assumed a bit coin mixer would not poll forever as that would be
// an insane overhead. I assumed a particular amount of retries & timeouts until it would stop
// polling. I also made an assumption that after the first transaction it would stop polling
const pollAddress = async (address, cbToDistribute) => {
  await retry(() => throwIfUnused(address), {
    retries: config.polling.tries,
    minTimeout: config.polling.timeout,
    factor: config.polling.factor,
  });
  logger.info(`Found a transfer inside the deposit address: ${address}, sending to the house address`);
  const currentBalance = await jobApiClient.getAddressBalance(address);
  // Start sending to house account
  await jobApiClient.sendTransaction(address, config.houseAccount, currentBalance);
  cbToDistribute(currentBalance, address);
};

/*
  Extremely simple async poller. Automatically keeps polling multiple addresses and does not care
  to await it.
 */
const poller = () => {
  const addItem = (address, cbToDistribute) => {
    logger.info(`Adding address: ${address} to our poller queue`);
    pollAddress(address, cbToDistribute);
  };
  return {
    addItem,
  };
};

module.exports = poller;

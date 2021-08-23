const { v4: uuidv4 } = require('uuid');
const logger = require('../common/logger');
const utils = require('../common/utils');
const config = require('../common/config/config');
const jobApiClient = require('./jobCoin');

const getRemainingAfterFee = (amount, feePercentage) => utils.convertToFloat(amount - (amount * feePercentage));
// Typically we calculate a random amount to send greater than a typical pecentage
// but to prevent doler from distributing forever, we choose to distribute remaining
// once it's below a specific amount
const calculateRandomAmount = (amount) => {
  if (amount <= utils.convertToFloat(config.doler.smallestAmount)) {
    return amount;
  }
  return utils.convertToFloat((utils.getRandomInt(10, 50) / 100) * amount);
};

// Select withdrawal address randomly to keep things as random as possible.
// better than having a system to distribute it equally because that would
// be easier to track down if trying to truly anonymize.
const selectWidrawalAddressRandomly = (withdrawalAddresses) => {
  const randomInt = utils.getRandomInt(0, withdrawalAddresses.length - 1);
  return withdrawalAddresses[randomInt];
};

const doler = () => {
  const transactionsToProcess = [];
  const transactionInformation = {};
  let currentlyRunning = false;
  const isTransactionRemaining = (messageId) => {
    if (transactionInformation && transactionInformation[messageId].remainingAmount === utils.convertToFloat(0)) {
      return false;
    }
    return true;
  };
  // Made an assumption to take fee from the beginning just to make things easier while developing
  const handleTransaction = async (messageId) => {
    const info = transactionInformation[messageId];

    if (info.originalAmount === info.remainingAmount) {
      info.remainingAmount = getRemainingAfterFee(info.originalAmount, info.feePercentage);
    }
    const amountToDeduct = calculateRandomAmount(info.remainingAmount);
    const withdrawalAddress = selectWidrawalAddressRandomly(info.withdrawalAddresses);
    logger.info(`Sending from house account to address: ${withdrawalAddress} for amount: ${amountToDeduct}`);
    await jobApiClient.sendTransaction(config.houseAccount, withdrawalAddress, amountToDeduct);
    info.remainingAmount = utils.convertToFloat(info.remainingAmount - amountToDeduct);
    info.lastWithdrawalDate = new Date();
  };
  // @TODO: Ideally we would be grouping together transactions into multiple promises and running all of them
  // asynchronously. We would have limit the groups together because JS can only handle so many
  // async processes at the same time.
  const startRunning = async () => {
    currentlyRunning = true;
    if (transactionsToProcess.length <= 0) {
      logger.info('No more items left for the doller to process. Shutting down');
      currentlyRunning = false;
      return;
    }
    const transactionToProcess = transactionsToProcess.shift();
    logger.info(`Handling transaction with messagee id: ${transactionToProcess}`);
    await handleTransaction(transactionToProcess);
    if (!isTransactionRemaining(transactionToProcess)) {
      delete transactionInformation[transactionToProcess];
    } else {
      transactionsToProcess.push(transactionToProcess); // Send back to the end of queue to process.
    }
    // makes it simple and more random too.
    startRunning();
  };
  const addItem = (amount, withdrawalAddresses) => {
    const messageId = uuidv4();
    transactionInformation[messageId] = {
      originalAmount: utils.convertToFloat(amount),
      remainingAmount: utils.convertToFloat(amount),
      withdrawalAddresses,
      feePercentage: utils.feePercentage(utils.convertToFloat(amount)) / 100,
      lastWithdrawalDate: new Date('0001-01-01T00:00:00Z'), // equivalent of DateTime.Min.
      // we store last withdrawal date in case in the future we want to prevent
      // amounts for same transaction being sent too close together (in case queue is small)
    };
    logger.info(`Adding item with message id: ${messageId} to doler to process`);
    transactionsToProcess.push(messageId);
    if (!currentlyRunning) {
      logger.info('Re-initating doler to start running');
      startRunning();
    }
  };
  return {
    addItem,
  };
};

module.exports = doler;

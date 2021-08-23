const jobClientApi = require('./jobCoin');
const utils = require('../common/utils');
const poller = require('./poller');
const doller = require('./doler');

const mixer = () => {
  const pollerClient = poller();
  const dollerClient = doller();
  const generateNewDepositAddress = async () => {
    let newDepositAddress = utils.generateDepositAddress();
    let isUnused = await jobClientApi.isAddressUnused(newDepositAddress);
    while (!isUnused) {
      newDepositAddress = utils.generateDepositAddress();
      isUnused = await jobClientApi.isAddressUnused(newDepositAddress);
    }
    return newDepositAddress;
  };
  const addItemToDistribute = async (amount, withdrawableAddresses) => {
    dollerClient.addItem(amount, withdrawableAddresses);
  };
  const beginPolling = (depositAddress, withdrawableAddresses) => {
    pollerClient.addItem(depositAddress, (amount) => addItemToDistribute(amount, withdrawableAddresses));
  };
  const startMixing = (addresses, depositAddress) => {
    beginPolling(depositAddress, utils.separateAddressesToArray(addresses));
  };

  return {
    generateNewDepositAddress,
    startMixing,
  };
};

module.exports = mixer;

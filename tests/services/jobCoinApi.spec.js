const chai = require('chai');
const moxios = require('moxios');
const mockUnusedAddress = require('../mocks/addressInfo/unusedAddress.json');
const mockUsedAddress = require('../mocks/addressInfo/usedAddress.json');
const jobCoinClient = require('../../services/jobCoin');

const { expect } = chai;

chai.use(require('chai-as-promised'));

describe('jobcoin api', () => {
  beforeEach(() => {
    moxios.install();
  });
  afterEach(() => {
    moxios.uninstall();
  });
  describe('isAddressUnused', () => {
    it('should successfully get unused address', async () => {
      const unusedAddress = '123';
      moxios.stubRequest(`${jobCoinClient.API_ADDRESS_URL}${unusedAddress}`, {
        status: 200,
        response: mockUnusedAddress,
      });
      expect(await jobCoinClient.isAddressUnused(unusedAddress)).to.equal(true);
    });
    it('should return false when error thrown', async () => {
      const unusedAddress = '123';
      moxios.stubRequest(`${jobCoinClient.API_ADDRESS_URL}${unusedAddress}`, {
        status: 400,
        response: 'Error',
      });
      expect(await jobCoinClient.isAddressUnused(unusedAddress)).to.equal(false);
    });
  });
  describe('getAddressBalance', () => {
    it('should successfully get address balance', async () => {
      const usedAddress = '123';
      moxios.stubRequest(`${jobCoinClient.API_ADDRESS_URL}${usedAddress}`, {
        status: 200,
        response: mockUsedAddress,
      });
      expect(await jobCoinClient.getAddressBalance(usedAddress)).to.equal(mockUsedAddress.balance);
    });
    it('should return null when there is an error', async () => {
      const usedAddress = '123';
      moxios.stubRequest(`${jobCoinClient.API_ADDRESS_URL}${usedAddress}`, {
        status: 404,
      });
      expect(await jobCoinClient.getAddressBalance(usedAddress)).to.equal(null);
    });
  });
  describe('sendTransaction', () => {
    it('should successfully get address balance', async () => {
      moxios.stubRequest(`${jobCoinClient.API_TRANSACTIONS_URL}`, {
        status: 200,
      });
      expect(await jobCoinClient.sendTransaction('from', 'to', 10)).to.equal(true);
    });
    it('should return null when there is an error', async () => {
      moxios.stubRequest(`${jobCoinClient.API_TRANSACTIONS_URL}`, {
        status: 404,
      });
      expect(await jobCoinClient.sendTransaction('from', 'to', 10)).to.equal(false);
    });
  });
});

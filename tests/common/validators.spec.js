const chai = require('chai');
const moxios = require('moxios');
const mockUnusedAddress = require('../mocks/addressInfo/unusedAddress.json');
const mockUsedAddress = require('../mocks/addressInfo/usedAddress.json');
const jobApiClient = require('../../services/jobCoin');
const { isValidCommaSeparated, validateAddresses } = require('../../common/validators');
chai.use(require('chai-as-promised'));

const { expect } = chai;

describe('validators', () => {
  describe('is valid comma separated', () => {
    it('should be a valid csv', () => {
      expect(isValidCommaSeparated('1,3,4,5')).to.equal(true);
    });
    it('should be not be a valid csv', () => {
      expect(isValidCommaSeparated('')).to.equal(false);
    });
  });
  describe('validate address', () => {
    beforeEach(() => {
      moxios.install();
    });
    afterEach(() => {
      moxios.uninstall();
    });
    it('should fail when used addresses are present as the withdrawal addresses', async () => {
      const unusedAddress = '123';
      const usedAddress = 'Alice1';
      moxios.stubRequest(`${jobApiClient.API_ADDRESS_URL}${unusedAddress}`, {
        status: 200,
        response: mockUnusedAddress,
      });
      moxios.stubRequest(`${jobApiClient.API_ADDRESS_URL}${usedAddress}`, {
        status: 200,
        response: mockUsedAddress,
      });
      expect(await validateAddresses(`${usedAddress},${unusedAddress}`)).to.equal('Not all addresses are unused. Used Addresses Present: Alice1');
    });
    it('should succeed when all addresses are unused', async () => {
      const unusedAddress1 = '123';
      const unusedAddress2 = 'Alice1';
      moxios.stubRequest(`${jobApiClient.API_ADDRESS_URL}${unusedAddress1}`, {
        status: 200,
        response: mockUnusedAddress,
      });
      moxios.stubRequest(`${jobApiClient.API_ADDRESS_URL}${unusedAddress2}`, {
        status: 200,
        response: mockUnusedAddress,
      });
      expect(await validateAddresses(`${unusedAddress1},${unusedAddress2}`)).to.equal(true);
    });
  });
});

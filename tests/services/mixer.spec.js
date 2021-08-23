const chai = require('chai');
const moxios = require('moxios');
const sinon = require('sinon');

const mixer = require('../../services/mixer');
const jobApiClient = require('../../services/jobCoin');

chai.use(require('chai-as-promised'));

const { expect } = chai;

describe('mixer', () => {
  let sinonSandbox;
  beforeEach(() => {
    moxios.install();
    sinonSandbox = sinon.createSandbox();
  });
  afterEach(() => {
    sinonSandbox.restore();
    moxios.uninstall();
  });
  describe('generateNewDepositAddress', () => {
    it('should generate a new deposit address, if previous one is already used', async () => {
      const stub = sinonSandbox.stub(jobApiClient, 'isAddressUnused').onFirstCall().returns(false).onSecondCall()
        .returns(true);
      const mixerClient = mixer('123');
      const depositAddress = await mixerClient.generateNewDepositAddress();
      expect(stub.callCount).to.equal(2);
      expect(depositAddress.length).to.be.greaterThan(4);
    });
  });
});

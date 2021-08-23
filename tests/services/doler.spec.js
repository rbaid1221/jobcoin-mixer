const { expect } = require('chai');
const sinon = require('sinon');
const jobApiClient = require('../../services/jobCoin');
const dollerClient = require('../../services/doler');
const utils = require('../../common/utils');

// @TODO: create a separate config section just for test environment, so that
// specific retry timeouts/randomizations are quicker.
describe('doler', () => {
  let sinonSandbox;
  beforeEach(() => {
    sinonSandbox = sinon.createSandbox();
  });
  afterEach(() => {
    sinonSandbox.restore();
  });
  it('should successfuly process the transaction', (done) => {
    const transactionStub = sinonSandbox.stub(jobApiClient, 'sendTransaction').resolves(true);
    const amount = 10;
    const withdrawableAddresses = ['123'];
    dollerClient().addItem(amount, withdrawableAddresses);
    setTimeout(() => {
      const callCounts = transactionStub.callCount;
      let actualTotal = 0;
      for (let i = 0; i < callCounts; i += 1) {
        const spyCall = transactionStub.getCall(i);
        const floatValue = parseFloat(utils.convertToFloat(spyCall.args[2]));
        actualTotal += floatValue;
      }
      expect(transactionStub.called).to.equal(true);
      const expectedValue = utils.convertToFloat(amount - (utils.feePercentage(amount) / 100) * amount);
      expect(utils.convertToFloat(actualTotal)).to.equal(expectedValue);
      done();
    }, 1000);
  });
});

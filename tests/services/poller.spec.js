const { expect } = require('chai');
const sinon = require('sinon');
const jobApiClient = require('../../services/jobCoin');
const poller = require('../../services/poller');

// @TODO: create a separate config section just for test environment, so that
// specific retry timeouts/randomizations are quicker.
describe('poller', () => {
  let sinonSandbox;
  beforeEach(() => {
    sinonSandbox = sinon.createSandbox();
  });
  afterEach(() => {
    sinonSandbox.restore();
  });
  it('should successfully call cb function when polling is successful', (done) => {
    const mockAddress = '123';
    const addressUnusedStub = sinonSandbox.stub(jobApiClient, 'isAddressUnused').onFirstCall().resolves(true).onSecondCall()
      .resolves(false);
    const addressBalanceStub = sinonSandbox.stub(jobApiClient, 'getAddressBalance').onFirstCall().resolves('15');
    const sendTransactionStub = sinonSandbox.stub(jobApiClient, 'sendTransaction').onFirstCall().resolves(true);
    const spy = sinonSandbox.spy();
    const pollerClient = poller();
    pollerClient.addItem(mockAddress, spy);
    setTimeout(() => { // Create a little bit of a timeout because many async calls are occurring.
      // especially because first address unused call retries after 1000Ms
      expect(addressUnusedStub.callCount).to.equal(2);
      expect(addressBalanceStub.callCount).to.equal(1);
      expect(sendTransactionStub.callCount).to.equal(1);
      expect(spy.callCount).to.equal(1);
      expect(spy.calledWith(mockAddress, spy));
      done();
    }, 1500);
  });
});

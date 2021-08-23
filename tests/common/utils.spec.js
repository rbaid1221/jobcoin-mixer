const { expect } = require('chai');
const utils = require('../../common/utils');

describe('utils', () => {
  it('should separate addresses successfully', () => {
    const separated = utils.separateAddressesToArray('Alice,123,,');
    expect(separated.length).to.equal(2);
    expect(separated[0]).to.equal('Alice');
    expect(separated[1]).to.equal('123');
  });
  it('generateDepositAddress generates a string with 8 characters', () => {
    const depositAddress = utils.generateDepositAddress();
    expect(typeof depositAddress).to.equal('string');
    expect(depositAddress).to.have.length(8);
  });
  it('should return a proper fee structure', () => {
    expect(utils.feePercentage(10001)).to.equal(2);
    expect(utils.feePercentage(5001)).to.equal(4);
    expect(utils.feePercentage(1000)).to.equal(5);
  });
});

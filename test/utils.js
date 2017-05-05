/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}]*/
const { toPromise } = require('../src/utils');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('toPromise', () => {
  it('accepts callbacks with result', async () => {
    const value = 'mock-result';
    const promise = toPromise((callback) => {
      callback(null, value);
    })();
    await expect(promise).to.become(value);
  });

  it('accepts callbacks without result', async () => {
    const promise = toPromise((callback) => {
      callback();
    })();
    await expect(promise).to.be.fulfilled();
  });

  it('reject callbacks with error', async () => {
    const error = new Error('mock-error');
    const promise = toPromise((callback) => {
      callback(error);
    })();
    await expect(promise).not.to.be.fulfilled();
    await expect(promise).to.be.rejectedWith(error);
  });
});

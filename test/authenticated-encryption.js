/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}]*/
const chai = require('chai');
const dirtyChai = require('dirty-chai');
const authenticatedEncryption = require('../src/authenticated-encryption');

const expect = chai.expect;
chai.use(dirtyChai);

describe('Authenticated encryption', () => {
  describe('#encrypt', () => {
    it('returns all required fields', () => {
      const encrypted = authenticatedEncryption.encrypt('plaintext');
      expect(encrypted).to.have.property('cipherText');
      expect(encrypted).to.have.property('iv');
      expect(encrypted).to.have.property('tag');
    });
    it('generates random iv', () => {
      const encrypted1 = authenticatedEncryption.encrypt('plaintext');
      const encrypted2 = authenticatedEncryption.encrypt('plaintext');
      expect(encrypted1.iv).to.be.not.equal(encrypted2.iv);
      expect(encrypted1.cipherText).to.be.not.equal(encrypted2.cipherText);
    });
    it('generates longer cypherText for longer data', () => {
      const encryptedShort = authenticatedEncryption.encrypt('plaintext');
      const encryptedLong = authenticatedEncryption.encrypt('Lorem ipsum dolor sit amet');
      expect(encryptedLong.cipherText).to.have.length.of.at.least(encryptedShort.cipherText.length);
    });
  });
  describe('#decrypt', () => {
    it('decrypts to the same value', () => {
      const encrypted = authenticatedEncryption.encrypt('plaintext');
      const decrypted = authenticatedEncryption.decrypt(encrypted);
      expect(decrypted.authOk).to.be.true();
      expect(decrypted.plainText).to.equal('plaintext');
    });
  });
});

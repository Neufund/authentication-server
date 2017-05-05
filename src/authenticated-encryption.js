/**
 * AES authenticated Encryption/Decryption with AES-256-GCM
 * Using random Key
 * Using random Initialization Vector for every packet
 */

// load the build-in crypto functions
const crypto = require('crypto');

// Generate random encryption key
const key = crypto.randomBytes(32);

function getTimeStamp() {
  return Math.floor(Date.now() / 1000);
}

// encrypt/decrypt functions
module.exports = {
  /**
   * @typedef {Object} EncryptionResult
   * @property {String} cipherText - the hex encoded encrypted data
   * @property {String} iv - the hex encoded initialization vector
   * @property {String} tag - the hex encoded auth tag
   */

  /**
   * Encrypts text by given key
   * @param {String} text - text to encrypt
   * @param {Integer} [ttl=10] - time in seconds during which the tag would be considered valid
   * @param {String} [aad=''] - additional authenticated data
   * @returns {EncryptionResult}
   */
  encrypt(text, ttl = 10, aad = '') {
    // random initialization vector
    const iv = crypto.randomBytes(12);

    // AES 256 GCM Mode
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    // Compute expiration time
    const expiresAt = getTimeStamp() + ttl;

    // Set additional authenticated data
    cipher.setAAD(new Buffer(JSON.stringify({ aad, expiresAt }), 'utf-8'));

    // encrypt the given text
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);

    // extract the auth tag
    const tag = cipher.getAuthTag();

    // serialize to EncryptionResult
    return {
      cipherText: encrypted.toString('hex'),
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
      expiresAt,
    };
  },

  /**
   * @typedef {Object} DecryptionResult
   * @property {String=} plainText - decrypted data
   * @property {Boolean} authOk - the auth check result
   */

  /**
   * Decrypts text by given key
   * @param {EncryptionResult} encryptionResult
   * @param {String} [aad=''] - additional authenticated data
   * @returns {DecryptionResult}
   */
  decrypt(encryptionResult, aad = '') {
    // Deserialize the encryptionResult
    const encrypted = new Buffer(encryptionResult.cipherText, 'hex');
    const iv = new Buffer(encryptionResult.iv, 'hex');
    const tag = new Buffer(encryptionResult.tag, 'hex');
    const expiresAt = encryptionResult.expiresAt;

    // Check if not expired
    if (getTimeStamp() > expiresAt) {
      return { authOk: false };
    }

    // AES 256 GCM Mode
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);

    // Set authentication tag
    decipher.setAuthTag(tag);

    // Set additional authenticated data
    decipher.setAAD(new Buffer(JSON.stringify({ aad, expiresAt }), 'utf-8'));

    try {
      // decrypt the given text
      return {
        plainText: decipher.update(encrypted, 'binary', 'utf8') + decipher.final('utf8'),
        authOk: true,
      };
    } catch (e) {
      // Authentication check failed
      return {
        authOk: false,
      };
    }
  },
};

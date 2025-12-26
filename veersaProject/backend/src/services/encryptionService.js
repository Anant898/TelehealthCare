const { encrypt, decrypt } = require('../middleware/encryption');

/**
 * Service for handling PHI data encryption/decryption
 */
class EncryptionService {
  static encryptPHI(data) {
    if (typeof data === 'object') {
      const encrypted = {};
      for (const [key, value] of Object.entries(data)) {
        if (value) {
          encrypted[key] = encrypt(value.toString());
        }
      }
      return encrypted;
    }
    return encrypt(data);
  }

  static decryptPHI(encryptedData) {
    if (typeof encryptedData === 'object') {
      const decrypted = {};
      for (const [key, value] of Object.entries(encryptedData)) {
        if (value) {
          decrypted[key] = decrypt(value);
        }
      }
      return decrypted;
    }
    return decrypt(encryptedData);
  }
}

module.exports = EncryptionService;


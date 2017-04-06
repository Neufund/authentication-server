const db = require('sqlite');

let userInsertStmt;

const init = async () => {
  userInsertStmt = await db.prepare(`INSERT INTO Users (email, kdfSalt, srpSalt, srpVerifier, timeBasedOneTimeSecret)
                                                VALUES ($email, $kdfSalt, $srpSalt, $srpVerifier, $timeBasedOneTimeSecret)`);
};

function dollarPrefixKeys(object) {
  const dollarPrefixedKeysObject = {};
  Object.keys(object).map(key => (dollarPrefixedKeysObject[`$${key}`] = object[key]));
  return dollarPrefixedKeysObject;
}

module.exports = {
  init,
  dollarPrefixKeys,
  get userInsertStmt() {
    return userInsertStmt;
  },
};

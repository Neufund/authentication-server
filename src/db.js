const db = require('sqlite');

let userInsertStmt;
let getLoginDataForEmailStmt;

const init = async () => {
  userInsertStmt = await db.prepare(
    `INSERT INTO Users (email, kdfSalt, srpSalt, srpVerifier, timeBasedOneTimeSecret)
                VALUES ($email, $kdfSalt, $srpSalt, $srpVerifier, $timeBasedOneTimeSecret)`);
  getLoginDataForEmailStmt = await db.prepare(
    `SELECT kdfSalt, srpSalt, srpVerifier, timeBasedOneTimeSecret FROM Users
     WHERE email = $email`);
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
  get getLoginDataForEmailStmt() {
    return getLoginDataForEmailStmt;
  },
};

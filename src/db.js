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

module.exports = {
  init,
  get userInsertStmt() {
    return userInsertStmt;
  },
  get getLoginDataForEmailStmt() {
    return getLoginDataForEmailStmt;
  },
};

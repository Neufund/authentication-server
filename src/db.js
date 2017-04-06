const db = require('sqlite');

let userInsertStmt;
let getUserByEmailStmt;

const init = async () => {
  userInsertStmt = await db.prepare(
    `INSERT INTO Users (email, kdfSalt, srpSalt, srpVerifier, timeBasedOneTimeSecret)
                VALUES ($email, $kdfSalt, $srpSalt, $srpVerifier, $timeBasedOneTimeSecret)`);
  getUserByEmailStmt = await db.prepare(`SELECT * FROM Users WHERE email = $email`);
};

module.exports = {
  init,
  get userInsertStmt() {
    return userInsertStmt;
  },
  get getUserByEmailStmt() {
    return getUserByEmailStmt;
  },
};

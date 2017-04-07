const db = require('sqlite');
const winston = require('winston');

let userInsertStmt;
let getUserByEmailStmt;

const init = async () => {
  await db.open(':memory:', { Promise, versobe: process.env.VERBOSE || false });
  await db.migrate();
  userInsertStmt = await db.prepare(
    `INSERT INTO Users (email, kdfSalt, srpSalt, srpVerifier, timeBasedOneTimeSecret)
                VALUES ($email, $kdfSalt, $srpSalt, $srpVerifier, $timeBasedOneTimeSecret)`);
  getUserByEmailStmt = await db.prepare('SELECT * FROM Users WHERE email = $email');
};

module.exports = {
  init,
  get db() {
    // eslint-disable-next-line no-console
    winston.warning('Do not use DB object itself. Use prepared statements instead');
    return db;
  },
  get userInsertStmt() {
    return userInsertStmt;
  },
  get getUserByEmailStmt() {
    return getUserByEmailStmt;
  },
};

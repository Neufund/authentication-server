const db = require('sqlite');
const winston = require('winston');

let userInsertStmt;
let getUserByEmailStmt;

const init = async () => {
  if (process.env.NODE_ENV === 'production') {
    await db.open(process.env.DB_PATH, { Promise, versobe: process.env.VERBOSE || false });
  } else {
    await db.open(':memory:', { Promise, versobe: process.env.VERBOSE || false });
    await db.migrate();
  }
  userInsertStmt = await db.prepare(
    `INSERT INTO Users (uuid, email, kdfSalt, srpSalt, srpVerifier, totpSecret)
                VALUES ($uuid, $email, $kdfSalt, $srpSalt, $srpVerifier, $totpSecret)`
  );
  getUserByEmailStmt = await db.prepare('SELECT * FROM Users WHERE email = $email');
};

module.exports = {
  init,
  get db() {
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

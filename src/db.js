const db = require('sqlite');

let userInsertStmt;

const init = async () => {
  userInsertStmt = await db.prepare(`INSERT INTO Users (email, kdfSalt, srpSalt, srpVerifier, timeBasedOneTimeSecret)
                                                VALUES (?email, ?kdfSalt, ?srpSalt, ?srpVerifier, ?timeBasedOneTimeSecret)`);
};

module.exports = {
  init,
  get userInsertStmt() {
    return userInsertStmt;
  },
};

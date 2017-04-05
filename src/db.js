const db = require('sqlite');

let userInsertStmt;

const init = async () => {
  userInsertStmt = await db.prepare('INSERT INTO Users (email) VALUES (?)');
};

module.exports = {
  init,
  get userInsertStmt() {
    return userInsertStmt;
  },
};

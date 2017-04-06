const router = require('express').Router();
const validate = require('express-jsonschema').validate;
const speakeasy = require('speakeasy');
const db = require('sqlite');
const fs = require('fs');
const statements = require('../db');

const userCreateSchema = JSON.parse(fs.readFileSync('./schemas/userCreateSchema.json'));

router.get('/', async (req, res) => {
  const users = await db.all('SELECT * FROM Users');
  res.send(users);
});

router.post('/', validate({ body: userCreateSchema }), async (req, res, next) => {
  try {
    const reqParams = (await statements).dollarPrefixKeys(req.body);
    const timeBasedOneTimeSecret = speakeasy.generateSecret({ length: 20 });
    const $timeBasedOneTimeSecret = timeBasedOneTimeSecret.base32;
    const queryParams = Object.assign({}, reqParams, { $timeBasedOneTimeSecret });
    await statements.userInsertStmt.run(queryParams);
    res.send(queryParams);
  } catch (e) {
    next(e);
  }
});

module.exports = router;

const router = require('express').Router();
const validate = require('express-jsonschema').validate;
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
    await statements.userInsertStmt.run(req.body);
    res.send(req.body);
  } catch (e) {
    next(e);
  }
});

module.exports = router;

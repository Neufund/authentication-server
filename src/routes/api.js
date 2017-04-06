const router = require('express').Router();
const validate = require('express-jsonschema').validate;
const speakeasy = require('speakeasy');
const fs = require('fs');
const Recaptcha = require('recaptcha-verify');
const { toPromise, catchAsyncErrors } = require('../utils');
const statements = require('../db');

const recaptcha = new Recaptcha({
  secret: process.env.RECAPTCHA_SECRET_KEY,
  verbose: true,
});

const userCreateSchema = JSON.parse(fs.readFileSync('./schemas/userCreateSchema.json'));

router.post('/signup', validate({ body: userCreateSchema }), catchAsyncErrors(async (req, res) => {
  const recaptchaResponse = await toPromise(recaptcha.checkResponse.bind(recaptcha))(req.body['g-recaptcha-response']);
  if (!recaptchaResponse.success) {
    throw new Error(recaptchaResponse['error-codes']);
  }
  const reqParams = (await statements).dollarPrefixKeys(req.body);
  const timeBasedOneTimeSecret = speakeasy.generateSecret({ length: 20 });
  const $timeBasedOneTimeSecret = timeBasedOneTimeSecret.base32;
  const queryParams = Object.assign({}, reqParams, { $timeBasedOneTimeSecret });
  await statements.userInsertStmt.run(queryParams);
  res.send(queryParams);
}));

module.exports = router;

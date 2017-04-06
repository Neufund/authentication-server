const router = require('express').Router();
const validate = require('express-jsonschema').validate;
const speakeasy = require('speakeasy');
const fs = require('fs');
const db = require('sqlite');
const jsrp = require('jsrp');
const Recaptcha = require('recaptcha-verify');
const { toPromise, catchAsyncErrors } = require('../utils');
const statements = require('../db');

const recaptcha = new Recaptcha({
  secret: process.env.RECAPTCHA_SECRET_KEY,
  verbose: true,
});

const signupSchema = JSON.parse(fs.readFileSync('./schemas/signupSchema.json'));
const loginSchema = JSON.parse(fs.readFileSync('./schemas/loginSchema.json'));

// TODO: Remove this debug endpoint
router.get('/', async (req, res) => {
  res.send(await db.all('SELECT * FROM Users'));
});

router.post('/signup', validate({ body: signupSchema }), catchAsyncErrors(async (req, res) => {
  const recaptchaResponse = await toPromise(
    recaptcha.checkResponse.bind(recaptcha))(req.body.captcha);
  if (!recaptchaResponse.success) {
    throw new Error(recaptchaResponse['error-codes']);
  }
  const timeBasedOneTimeSecret = speakeasy.generateSecret({ length: 20 });
  const $timeBasedOneTimeSecret = timeBasedOneTimeSecret.base32;
  const queryParams = {
    $email: req.body.email,
    $kdfSalt: req.body.kdfSalt,
    $srpSalt: req.body.srpSalt,
    $srpVerifier: req.body.srpVerifier,
    $timeBasedOneTimeSecret,
  };
  await statements.userInsertStmt.run(queryParams);
  res.send(queryParams);
}));

router.post('/login', validate({ body: loginSchema }), catchAsyncErrors(async (req, res) => {
  const clientPublicKey = req.body.publicKey;
  const clientProof = req.body.clientProof;
  const email = req.body.email;
  const { srpSalt, srpVerifier } = await statements.getLoginDataForEmailStmt.get({ $email: email });
  // eslint-disable-next-line new-cap
  const srpServer = new jsrp.server();
  await toPromise(srpServer.init.bind(srpServer))({ salt: srpSalt, verifier: srpVerifier });
  srpServer.setClientPublicKey(clientPublicKey);
  if (srpServer.checkClientProof(clientProof)) {
    // TODO Issue JWT
    res.send(srpServer.getProof());
  } else {
    throw new Error('Login failed');
  }
}));

module.exports = router;

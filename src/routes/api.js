const router = require('express').Router();
const validate = require('express-jsonschema').validate;
const speakeasy = require('speakeasy');
const fs = require('fs');
const jsrp = require('jsrp');
const Recaptcha = require('recaptcha-verify');
const { toPromise, catchAsyncErrors } = require('../utils');
const database = require('../database');

const signupSchema = JSON.parse(fs.readFileSync('./schemas/signupSchema.json'));
const loginDataSchema = JSON.parse(fs.readFileSync('./schemas/loginDataSchema.json'));
const loginSchema = JSON.parse(fs.readFileSync('./schemas/loginSchema.json'));

// TODO: Remove this debug endpoint
router.get('/', async (req, res) => {
  res.send(await database.db.all('SELECT * FROM Users'));
});

router.post('/signup', validate({ body: signupSchema }), catchAsyncErrors(async (req, res) => {
  const recaptcha = new Recaptcha({
    secret: process.env.RECAPTCHA_SECRET_KEY,
    verbose: process.env.VERBOSE || false,
  });
  const recaptchaResponse = await toPromise(
    recaptcha.checkResponse.bind(recaptcha))(req.body.captcha);
  if (!recaptchaResponse.success) {
    res.status(400).send('reCAPTCHA verification failed');
    return;
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
  await database.userInsertStmt.run(queryParams);
  res.send($timeBasedOneTimeSecret);
}));

// TODO sign the response with mac
router.post('/login-data', validate({ body: loginDataSchema }), catchAsyncErrors(async (req, res) => {
  const email = req.body.email;
  const {
    kdfSalt,
    srpSalt,
    srpVerifier,
  } = await database.getLoginDataForEmailStmt.get({ $email: email });
  // eslint-disable-next-line new-cap
  const srpServer = new jsrp.server();
  await toPromise(srpServer.init.bind(srpServer))({ salt: srpSalt, verifier: srpVerifier });
  const responseData = {
    serverPublicKey: srpServer.getPublicKey(),
    kdfSalt,
    srpSalt,
  };
  res.send(responseData);
}));

router.post('/login', validate({ body: loginSchema }), catchAsyncErrors(async (req, res) => {
  const clientPublicKey = req.body.publicKey;
  const clientProof = req.body.clientProof;
  const email = req.body.email;
  const { srpSalt, srpVerifier } = await database.getUserByEmailStmt.get({ $email: email });
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

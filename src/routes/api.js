/* eslint new-cap: ["error", {
 "newIsCapExceptions": ["jsrp.server"],
 "capIsNewExceptions": ["Router"] }] */
const router = require('express').Router();
const validate = require('express-jsonschema').validate;
const speakeasy = require('speakeasy');
const fs = require('fs');
const jsrp = require('jsrp-server-fast');
const jwt = require('jsonwebtoken');
const uuidV4 = require('uuid/v4');
const Recaptcha = require('recaptcha-verify');
const { toPromise, catchAsyncErrors } = require('../utils');
const database = require('../database');
const authenticatedEncryption = require('../authenticated-encryption');

const signupSchema = JSON.parse(fs.readFileSync('./schemas/signupSchema.json'));
const loginDataSchema = JSON.parse(fs.readFileSync('./schemas/loginDataSchema.json'));
const loginSchema = JSON.parse(fs.readFileSync('./schemas/loginSchema.json'));
const jwtPrivateKey = fs.readFileSync('./ec512.prv.pem');

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
  const totpSecret = speakeasy.generateSecret({ length: 20 });
  const $totpSecret = totpSecret.base32;
  const queryParams = {
    $uuid: uuidV4(),
    $email: req.body.email,
    $kdfSalt: req.body.kdfSalt,
    $srpSalt: req.body.srpSalt,
    $srpVerifier: req.body.srpVerifier,
    $totpSecret,
  };
  await database.userInsertStmt.run(queryParams);
  res.send($totpSecret);
}));

router.post('/login-data', validate({ body: loginDataSchema }), catchAsyncErrors(async (req, res) => {
  const email = req.body.email;
  const {
    kdfSalt,
    srpSalt,
    srpVerifier,
  } = await database.getUserByEmailStmt.get({ $email: email });
  const srpServer = new jsrp.server();
  await toPromise(srpServer.init.bind(srpServer))({
    salt: srpSalt,
    verifier: srpVerifier,
    length: 4096,
  });
  const encryptedPart = authenticatedEncryption.encrypt(
    srpServer.getPrivateKey(),
    process.env.ENCRYPTION_TTL || 10,
    srpVerifier);
  const responseData = {
    serverPublicKey: srpServer.getPublicKey(),
    kdfSalt,
    srpSalt,
    encryptedPart,
  };
  res.send(responseData);
}));

router.post('/login', validate({ body: loginSchema }), catchAsyncErrors(async (req, res) => {
  const email = req.body.email;
  const { srpSalt, srpVerifier, totpSecret, uuid } =
    await database.getUserByEmailStmt.get({ $email: email });
  const timeBasedOneTimePasswordParams = {
    secret: totpSecret,
    encoding: 'base32',
    token: req.body.timeBasedOneTimeToken,
  };
  if (!speakeasy.totp.verify(timeBasedOneTimePasswordParams)) {
    res.status(403).send('2FA authentication failed');
    return;
  }
  const decryptionResult = authenticatedEncryption.decrypt(req.body.encryptedPart, srpVerifier);
  if (!decryptionResult.authOk) {
    res.status(403).send('Encrypted part integrity check failed');
    return;
  }
  const srpServer = new jsrp.server();
  await toPromise(srpServer.init.bind(srpServer))({
    salt: srpSalt,
    verifier: srpVerifier,
    b: decryptionResult.plainText,
    length: 4096,
  });
  srpServer.setClientPublicKey(req.body.clientPublicKey);
  if (srpServer.checkClientProof(req.body.clientProof)) {
    const jwtPayload = { email, loginMethod: '2FA', uuid };
    const jwtOptions = {
      issuer: 'Neufund',
      algorithm: 'ES512',
    };
    res.send({
      serverProof: srpServer.getProof(),
      token: jwt.sign(jwtPayload, jwtPrivateKey, jwtOptions),
    });
  } else {
    res.status(403).send('Login failed');
  }
}));

module.exports = router;

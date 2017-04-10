/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}]*/
/* eslint new-cap: ["error", {"newIsCapExceptions": ["jsrp.client"]}] */
const chai = require('chai');
const chaiHttp = require('chai-http');
const dirtyChai = require('dirty-chai');
const app = require('../src');
const database = require('../src/database');
const Recaptcha = require('recaptcha-verify');
const jsrp = require('jsrp');
const scrypt = require('scrypt-async');
const randomBytes = require('randombytes');
const sinon = require('sinon');
const winston = require('winston');

const expect = chai.expect;
chai.use(chaiHttp);
chai.use(dirtyChai);

winston.remove(winston.transports.Console);

process.env.RECAPTCHA_SECRET_KEY = true;

async function srpRegister(username, passphrase) {
  const parameters = {
    username,
    password: passphrase,
    length: 4096,
  };
  const srpClient = new jsrp.client();
  await new Promise(resolve => srpClient.init(parameters, resolve));
  return new Promise((resolve, reject) =>
    srpClient.createVerifier((err, result) =>
      (err ? reject(err) : resolve(result))));
}

let server;
const signupUrl = '/api/signup';
const email = 'logvinov.leon@gmail.com';
const passphrase = 'password';
const kdfSalt = randomBytes(32).toString('hex');
let hashedPassphrase;

let userSignupData;
let srpParameters;

async function hashPassphrase(pass) {
  const scryptParameters = {
    N: 16384, // about 100ms
    r: 8,
    p: 1,
    dkLen: 16,
    encoding: 'binary',
  };
  return new Promise(resolve => (scrypt(pass, kdfSalt, scryptParameters, resolve)));
}

async function init() {
  server = await app;
  hashedPassphrase = await hashPassphrase(passphrase);
  const { salt, verifier } = await srpRegister(email, hashedPassphrase);
  userSignupData = {
    email,
    kdfSalt,
    srpSalt: salt,
    srpVerifier: verifier,
    captcha: 'goodCaptcha',
  };
  srpParameters = {
    username: email,
    password: hashedPassphrase,
    length: 4096,
  };
}

// This piece of magic is here, because you can't have async init actions before describe
// It requires you to run mocha with --delay flag
init().then(run);

describe('Auth server', () => {
  beforeEach('Delete all users', async () => {
    await database.db.run('DELETE FROM Users');
  });

  describe('captcha check mocked', () => {
    before('stub captcha verification', () => {
      sinon.stub(Recaptcha.prototype, 'checkResponse').callsFake((userResponse, callback) => {
        const data = { success: userResponse === 'goodCaptcha' };
        if (data.success) { data['error-codes'] = 'mockError'; }
        callback(null, data);
      });
    });

    after('restore captcha verification', () => {
      Recaptcha.prototype.checkResponse.restore();
    });

    describe('/api/signup', () => {
      const url = signupUrl;

      it('validates schema', async () => (
        chai.request(server).post(url).catch(err => expect(err).to.have.status(400))
      ));
      describe('should check captcha', () => {
        it('throws an error on wrong captcha', async () => (
          chai.request(server).post(url)
            .send(Object.assign({}, userSignupData, { captcha: 'wrongCaptcha' }))
            .catch((err) => {
              expect(err).to.have.status(400);
              expect(err.response.text).equal('reCAPTCHA verification failed');
            })
        ));
        it('succeeds with good captcha', async () => {
          const res = await chai.request(server).post(url).send(userSignupData);
          expect(res).to.have.status(200);
        });
      });
      it('stores user data in DB', async () => {
        await chai.request(server).post(url).send(Object.assign(userSignupData));
        const users = await database.db.all('SELECT * FROM Users');
        expect(users).to.have.lengthOf(1);
        const user = users[0];
        expect(user).to.not.have.property('captcha');
        expect(user).to.have.property('id', 1);
        expect(user).to.have.property('email', userSignupData.email);
        expect(user).to.have.property('newEmail', null);
        expect(user).to.have.property('emailToken', null);
        expect(user).to.have.property('kdfSalt', userSignupData.kdfSalt);
        expect(user).to.have.property('srpSalt', userSignupData.srpSalt);
        expect(user).to.have.property('srpVerifier', userSignupData.srpVerifier);
        expect(user).to.have.property('created');
        expect(user).to.have.property('updated');
        expect(user).to.have.property('lastUsed');
        expect(user).to.have.property('timeBasedOneTimeSecret');
      });
      it('returns OTP code', async () => {
        const res = await chai.request(server).post(url).send(Object.assign(userSignupData));
        expect(res.text).to.have.lengthOf(32);
      });
    });
    describe('login tests', () => {
      beforeEach('Create test user', async () => {
        await chai.request(server).post(signupUrl).send(userSignupData);
      });

      describe('/api/login-data', () => {
        const url = '/api/login-data';

        it('gets user login data', async () => {
          const loginDataResponse = await chai.request(server)
            .post(url).send({ email: userSignupData.email });
          expect(loginDataResponse).to.have.status(200);
          const loginData = loginDataResponse.body;
          expect(loginData).to.have.property('serverPublicKey');
          expect(loginData).to.have.property('kdfSalt', userSignupData.kdfSalt);
          expect(loginData).to.have.property('srpSalt', userSignupData.srpSalt);
        });
      });
      describe('/api/login', () => {
        const url = '/api/login';
        let loginData;
        let srpClient;

        beforeEach('get login data', async () => {
          loginData = (await chai.request(server)
            .post('/api/login-data').send({ email })).body;
        });

        async function login(password) {
          srpClient = new jsrp.client();
          const hashedPassword = await hashPassphrase(password);
          await new Promise(resolve => srpClient.init(
            Object.assign({}, srpParameters, { password: hashedPassword }),
            resolve));
          srpClient.setSalt(userSignupData.srpSalt);
          srpClient.setServerPublicKey(loginData.serverPublicKey);
          const loginRequestPayload = {
            clientProof: srpClient.getProof(),
            clientPublicKey: srpClient.getPublicKey(),
            serverPrivateKey: loginData.serverPrivateKey,
            email,
          };
          return chai.request(server)
            .post(url).send(loginRequestPayload);
        }

        it('logs in with correct password', async () => {
          const response = await login(passphrase);
          expect(response).to.have.status(200);
        });
        it('fails to log in with wrong password', async () => (
          login('some crap').catch((err) => {
            expect(err).to.have.status(403);
            expect(err.response.text).to.be.equal('Login failed');
          })
        ));
        it('returns correct server proof', async () => {
          const response = await login(passphrase);
          expect(srpClient.checkServerProof(response.text)).to.be.true();
        });
      });
    });
  });
});

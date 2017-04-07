/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}]*/
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../src');
const database = require('../src/database');
const Recaptcha = require('recaptcha-verify');
const sinon = require('sinon');
const winston = require('winston');

const expect = chai.expect;
chai.use(chaiHttp);

winston.remove(winston.transports.Console);

describe('Auth server', () => {
  let server;

  before('Wait for DB initialization', async () => {
    process.env.RECAPTCHA_SECRET_KEY = true;
    server = await app;
  });
  beforeEach('Delete all users', async () => {
    await database.db.run('DELETE FROM Users');
  });

  describe('/api/signup', () => {
    const url = '/api/signup';
    const userSignupData = {
      email: 'logvinov.leon@gmail.com',
      kdfSalt: '4c8ef9dbfff033fcbc158ed6d54b9ed14f4df6bcbf7d0887c00e377d2cb15e5e',
      srpSalt: 'c104a024e15ed8c2b4b20e601dba90772205f0fc5a1cb56f637da2e790b55813',
      srpVerifier: '4c8ef9dbfff033fcbc158ed6d54b9ed14f4df6bcbf7d0887c00e377d2cb15e5e',
      captcha: 'goodCaptcha',
    };

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

    it('should validate schema', async () => (
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
    it('should store user data in DB', async () => {
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
    it('should return OTP code', async () => {
      const res = await chai.request(server).post(url).send(Object.assign(userSignupData));
      expect(res.text).to.have.lengthOf(32);
    });
  });
});

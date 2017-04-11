# authentication-server-node [![Build Status](https://travis-ci.org/Neufund/authentication-server-node.svg)](https://travis-ci.org/Neufund/authentication-server-node)

[![Greenkeeper badge](https://badges.greenkeeper.io/Neufund/authentication-server.svg)](https://greenkeeper.io/)

JWT Authentication server using email, password, captcha and Google Authenticator

Main Features:

* Password strengthening using [scrypt][7] [RFC7914][5]
* Password authentication using [SRP-6a][1] [RFC2945][6] [RFC5054][2]
* One time tokens using [TOTP][11] [RFC4226][8] [RFC6238][3]
* Human detection using [reCAPTCHA][4]
* Authorized using [JWT][9] [RFC7519][10]

[1]: http://srp.stanford.edu/
[2]: https://tools.ietf.org/html/rfc5054
[3]: https://www.ietf.org/rfc/rfc6238.txt
[4]: https://developers.google.com/recaptcha/intro
[5]: https://tools.ietf.org/html/rfc7914
[6]: https://tools.ietf.org/html/rfc2945
[7]: https://www.tarsnap.com/scrypt.html
[8]: https://tools.ietf.org/html/rfc4226
[9]: https://jwt.io/
[10]: https://tools.ietf.org/html/rfc7519
[11]: https://en.wikipedia.org/wiki/Time-based_One-time_Password_Algorithm

## Build, test and run

```
yarn
```

Generate a keypair:
```
openssl ecparam -genkey -name secp521r1 -noout -out ec512.prv.pem
openssl ec -in ec512.prv.pem -pubout > ec512.pub.pem
```

Run tests & lint:
```
yarn test & yarn lint
```

Start server:
```
yarn start
```

## How to use

You can find a client-side library here: [authentication-client](https://github.com/Neufund/authentication-client)


## Specification

### Database Schema


|        Column           |   Type    |                      Description           |
|-------------------------|-----------|--------------------------------------------|
| `id`                    | integer   | User id                                    |
| `email`                 | text      | Email                                      |
| `newEmail`              | text      | New unconfirmed email                      |
| `emailToken`            | text      | Email confirmation token                   |
| `created`               | timestamp | Creation time                              |
| `updated`               | timestamp | Last update time                           |
| `lastUsed`              | timestamp | Last usage time)                           |
| `kdfSalt`               | blob      | Key derivation function salt               |
| `srpSalt`               | blob      | SRP salt                                   |
| `srpVerifier`           | blob      | SRP verifier                               |
| `totpSecret`            | boob      | Time bases one time passsword secret (2FA) |   

### Parameters

#### scrypt

|         |       |
|---------|-------|
| `N`     | 16384 |
| `r`     |     8 |
| `p`     |     1 |
| `dkLen` |    32 |

The result taken in raw `binary` form. 256 bit random salt.

#### SRP-6a

4096-bit Group parameters (RFC5054 [§A.5][rfc5054-18]). 256 bit random salts and nonces.

[rfc5054-18]: https://tools.ietf.org/html/rfc5054#page-18

### Sign-up

Note: Captcha prevents this from automated detecting user existence

1. User: generates random 32 byte `kdfSalt`
2. User: generates random 32 byte `srpSalt`
3. User: `key = scrypt(password, kdfSalt)`
4. User: `verifier = SRP6A_verifier(email, key, srpSalt)`
5. User calls `/api/signup` with:
    * `email`
    * `kdfSalt`
    * `srpSalt`
    * `verifier`
    * `captcha`
6. Server validates recaptcha
7. Server generates `totpSecret`
8. Server creates new user with submitted data
9. Server returns `totpSecret`

### Log-in

1. User calls `/api/login-data` with:
    * `email`
2. Server responds with:
    * `kdfSalt`
    * `srpSalt`
    * `serverPublicKey`
    * encrypted and authenticated:
        * `serverPrivateKey`
3. User calls `/api/login` with:
    * `clientProof`
    * `clientPublicKey`
    * `email`
    * `timeBasedOneTimeToken`
    * encrypted and authenticated:
        * `serverPrivateKey`
4. Server verifies all the data and checks:
    * the client proof
    * integrity of encrypted part
    * 2FA token
5. Server issues the JSON Web Token
6. Server returns:
    * `token`
    * `serverProof`
7. Client verifies server proof

## FAQ

### Why are passwords so difficult?

* Because they often have low entropy (like the codes on a suitcase, you can try all options in a few days).

* Because people use the same password in many places, so even if your site is not important—the same password may access the users bank account.

### What's wrong with sending plain password over https?

CA's are unreliable, TLS is too complex/buggy.

* http://heartbleed.com/
* https://en.wikipedia.org/wiki/Cloudbleed
* https://groups.google.com/a/chromium.org/forum/#!topic/blink-dev/eUAKwjihhBs

### What's wrong with sending `hash(salt, pwd)`?

Does not protect against password brute forcing. An attacker who has the salt and hash can rapidly try combinations.

### Why not just Scrypt?

It's a lot better, but an attacker that has the salt and hash can still try passwords without being detected. Just much more slowly.

### Why not just SRP-6a?

SRP protects against eavesdroppers, nothing send over the wire will help an attacker.

But now the server stores something that is roughly similar to a salted hash: if an attacker obtains the user database, (s)he can quickly do an brute force.

By using both we make it impossible to attack the password when the TLS leaks and very hard when the user database is leaked.

### Why not SMS Verification?

[SMS is not secure][kraken-sms]

[kraken-sms]: http://blog.kraken.com/post/153209105847/security-advisory-mobile-phones

### Why generate the salt client side

It is in the clients interest to protect itself.

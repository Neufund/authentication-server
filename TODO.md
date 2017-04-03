# TODO

* [x] Backend for storing data (sqlite3 for now)
* [ ] `/api/signup_challenge`: collect signup data, return {salt, sercret1}
* [ ] `/api/signup_response`: collect verifier
* [ ] `/api/email_confirm`
* [ ] `/api/challenge`: collect username, google authenticator return {salt, secret1}
* [ ] `/api/login`: log in
* [ ] Return Google Authenticator key
* [ ] Log in using {email, passphrase, one-time-key}
* [ ] Authenticate using SRP (https://www.npmjs.com/package/srp)
* [ ] Change password
* [ ] Reset password by email and 2F
* [ ] Demo frontend with JS
* [ ] QR code ready urls according to [1] (or should this go in front-end?)
* [ ] Validate Email

[1]: https://github.com/google/google-authenticator/wiki/Key-Uri-Format

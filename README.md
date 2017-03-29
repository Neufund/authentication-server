# authentication-server
JWT Authentication server using email, password, captcha and Google Authenticator

Main Features:

* Password authentication using [SRP-6a][1]
* One time tokens using [TOTP][2]
* Email verification using SendGrid

[1]: http://srp.stanford.edu/
[2]: https://www.ietf.org/rfc/rfc6238.txt

## Build, test and run

```
virtualenv -p $(which python3) env
source env/bin/activate
pip install -r requirements.txt
```

Generate a keypair:
```
openssl ecparam -genkey -name secp521r1 -noout -out ec512.prv.pem
openssl ec -in ec512.prv.pem -pubout > ec512.pub.pem
```

Run unit tests:
```
pytest -v src tests
```

Start server:
```
FLASK_APP=src/server.py flask run
```

## How to use



## Technical details

SRP-6a is

* https://www.npmjs.com/package/srp

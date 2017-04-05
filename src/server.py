from flask import Flask, request
from werkzeug.exceptions import Unauthorized
import json
import db
import mac
import password
import recaptcha

app = Flask(__name__)
app.config.from_pyfile('config.py')

def remoteip():
    if 'X-Forwarded-For' in request.headers:
        remote_addr = request.headers.getlist("X-Forwarded-For")[0].rpartition(' ')[-1]
    return request.remote_addr

@app.route('/signup', methods=['POST'])
def signup():
    req = request.get_json()
    req['email']
    req['salt']
    req['verifier']
    if not recaptcha.verify(req['recaptcha'], remoteip()):
        assert(False)
    print(req)
    db.create(user)
    res = {
        'pubkey': None,
        'totp_secret': None,
        'jwt': None,
    }
    return json.dumps(mac.authenticate(res))


@app.route('/confirm', methods=['GET'])
def confirm():
    return {}


@app.route('/login', methods=['POST'])
def login():
    res = {

    }
    return json.dumps(res)


@app.route('/update', methods=['POST'])
def update():
    return {}


if __name__ == '__main__':
    app.run()

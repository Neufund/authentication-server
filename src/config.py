from datetime import timedelta

def read(filename):
    with open(filename, "r") as file:
        return file.read()

DB_NAME = 'users.db'
JWT_ISSUER = 'auth-srv'
JWT_AUDIENCE = '2FA'
JWT_AUDIENCES = ['key', '2FA']
JWT_LIFE_TIME = timedelta(minutes=30)
JWT_ALGORITHM = 'ES512'
JWT_PUBLIC_KEY = read('ec512.pub.pem')
JWT_PRIVATE_KEY = read('ec512.prv.pem')
RECAPTCHA_URL = 'https://www.google.com/recaptcha/api/siteverify'
RECPATCHA_SECRET = ''

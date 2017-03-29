import random
import string
from datetime import timedelta

DB_NAME = 'users.db'
JWT_ISSUER = 'Neufund'
JWT_AUDIENCE = '2FA'
JWT_LIFE_TIME = timedelta(minutes=30)
JWT_ALGORITHM = 'ES512'
JWT_PUBLIC_KEY_PATH = 'ec512.pub.pem'
JWT_PRIVATE_KEY_PATH = 'ec512.prv.pem'
JWT_PUBLIC_KEY = None
JWT_PRIVATE_KEY = None

def read_keys():
    global JWT_PUBLIC_KEY_PATH, JWT_PRIVATE_KEY_PATH
    global JWT_PUBLIC_KEY, JWT_PRIVATE_KEY
    with open(JWT_PUBLIC_KEY_PATH, "r") as publicKey:
        JWT_PUBLIC_KEY = publicKey.read()
    with open(JWT_PRIVATE_KEY_PATH, "r") as privateKey:
        JWT_PRIVATE_KEY = privateKey.read()

read_keys()

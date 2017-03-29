import jwt
import datetime
import config

def issue(pubkey):
    return jwt.encode({
        'sub': pubkey,
        'exp': datetime.datetime.now() + JWT_LIFE_TIME,
        'iss': JWT_ISSUER,
        'aud': JWT_AUDIENCES
    }, JWT_PRIVATE_KEY, algorithm=JWT_ALGORITHM)

def verify(token):
    return jwt.decode(token, JWT_PUBLIC_KEY, algorithm=JWT_ALGORITHM, audience=JWT_AUDIENCE)

import os
import hmac
import json
import base64
import time

expiry = 300

def key(size=32):
    r = os.urandom(size)
    assert(len(r) == size)
    return r

mac = hmac.new(key(), digestmod='SHA224')

def canonical(message):
    return json.dumps(
        message,
        ensure_ascii=False,
        indent=None,
        separators=(',', ':'),
        sort_keys=True
        ).encode('utf8')

def authenticate(message):
    assert(type(message) == dict)
    assert(not 'mac' in message)
    assert(not 'exp' in message)
    message = dict(message) # Shallow copy
    message['exp'] = round((time.monotonic() + expiry) / 10)
    s = mac.copy()
    s.update(canonical(message))
    d = s.digest()
    assert(len(d) == 28)
    message['mac'] = base64.b85encode(d).decode('ascii')
    return message

def verify(message):
    try:
        digest = base64.b85decode(message['mac'])
        assert(len(digest) == 28)
        message = dict(message) # Shallow copy
        now = round(time.monotonic() / 10)
        then = round((time.monotonic() + expiry) / 10)
        print(now, then, message['exp'])
        assert(message['exp'] >= now)
        assert(message['exp'] <= then)
        message.pop('mac')
        s = mac.copy()
        s.update(canonical(message))
        d = s.digest()
        assert(len(d) == 28)
        assert(hmac.compare_digest(d,digest))
        message.pop('exp')
        return message
    except:
        return None

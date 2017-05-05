import requests

def verify(token, remoteip=None):
    req = {
        'secret': RECPATCHA_SECRET,
        'response': token,
    }
    if remoteip:
        req['remoteip'] = remoteip
    r = requests.get(RECPATCHA_URL, params=req)
    return r.json()["success"] if r.status_code == 200 else False

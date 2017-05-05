import srp
import os
import base64

# SRP-6a with SHA256 and NG_4096

def salt():
    r = os.urandom(32)
    assert(len(r) == 32)
    return base64.b85encode(r).decode('ascii')

def create()

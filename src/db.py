import sqlite3
from config import DB_NAME

con = sqlite3.connect(DB_NAME)

con.execute(\
    'create table if not exists users('\
    'id integer primary key asc, '\
    'pubkey text, '\
    'email text unique, '\
    'new_email text unique, '\
    'email_token text, '\
    'created integer, '\
    'updated integer, '\
    'srp_salt blob, '\
    'srp_verifier blob, '\
    'reset_token text, '\
    'totp_secret blob'\
    ')')

cur = con.cursor()
cur.execute('select count(*) from users;')
row = cur.fetchone()
print('Found {0} users'.format(row[0]))

def insert_user():
    pass

def get_user(email):
    pass

def update_user(user):
    pass

from flask import Flask, request
from werkzeug.exceptions import Unauthorized

app = Flask(__name__)
app.config.from_pyfile('config.py')

@app.route('/signup', methods=['POST'])
def signup():
    return {}


@app.route('/confirm', methods=['GET'])
def confirm():
    return {}


@app.route('/login', methods=['POST'])
def login():
    return {}


@app.route('/update', methods=['POST'])
def update():
    return {}

if __name__ == '__main__':
    app.run()

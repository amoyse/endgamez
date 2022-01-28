from flask import Flask


app = Flask(__name__)
app.debug = True
app.secret_key = "KJHGLKJGjglkjhskdfjsJKHGk"

@app.route('/')
def home():
    return "<h1>Hello World!</h1>"


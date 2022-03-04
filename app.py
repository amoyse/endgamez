from flask import Flask, render_template
import requests

app = Flask(__name__)
app.secret_key = "KJHGLKJGjglkjhskdfjsJKHGk"



@app.route("/")
def home():
    # a = requests.get("http://tablebase.lichess.ovh/standard?fen=4k3/6KP/8/8/8/8/7p/8_w_-_-_0_1")
    return render_template("homePageWhite.html")
    

@app.route("/playing")
def playingPage():
   return render_template("playingPageWhite.html") 

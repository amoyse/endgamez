from flask import Flask, render_template, request, redirect, url_for
from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, PasswordField, BooleanField
import requests
import sqlite3

app = Flask(__name__)
app.secret_key = "KJHGLKJGjglkjhskdfjsJKHGk"

class EndgamePage:

    def __init__(self):
        self.__numberOfEndgames = 0
        self.endgames = []

    def fetchEndgames(self, abilities): # select items from the database depending on what ability level(s) they selected
        conn = sqlite3.connect("database.db")
        c = conn.cursor()
        endgames = []
        for i in range(len(abilities)):
           e =  c.execute("SELECT * FROM ENDGAMES WHERE ABILITY=(?)", (abilities[i],)).fetchall()
           self.endgames.append(e)
        
        conn.commit()
        conn.close()
            

    def getNumnerOfEndgames(self):
        return self.__numberOfEndgames


@app.route("/", methods=["GET", "POST"])
def home():
    # a = requests.get("httBeginnerp://tablebase.lichess.ovh/standard?fen=4k3/6KP/8/8/8/8/7p/8_w_-_-_0_1")
    
    if request.method == "POST":
        abilities = request.form.getlist("myCheckbox")
        endgamePage = EndgamePage()
        endgamePage.fetchEndgames(abilities)
        return redirect(url_for("endgameSelect"))
    return render_template("homePageWhite.html")

    

@app.route("/select-endgame")
def endgameSelect():
    return render_template("newRoomWhite.html")

@app.route("/playing")
def playingPage():
   return render_template("playingPageWhite.html") 

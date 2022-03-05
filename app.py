from flask import Flask, render_template, request, redirect, url_for, session, flash
from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, PasswordField, BooleanField
import requests
import sqlite3

app = Flask(__name__)
app.secret_key = "KJHGLKJGjglkjhskdfjsJKHGk"

class Endgames:

    def fetchEndgames(self, abilities): # select items from the database depending on what ability level(s) they selected
        conn = sqlite3.connect("database.db")
        c = conn.cursor()
        endgames = []
        for i in range(len(abilities)):
            e =  c.execute("SELECT * FROM ENDGAMES WHERE ABILITY=(?)", (abilities[i],)).fetchall()
            for j in e:
                endgames.append(j)
        
        conn.commit()
        conn.close()

        return endgames
            
    


@app.route("/", methods=["GET", "POST"])
def home():
    s = session.get("abilities", None)
    if s is not None:
        del session["abilities"]
    # a = requests.get("httBeginnerp://tablebase.lichess.ovh/standard?fen=4k3/6KP/8/8/8/8/7p/8_w_-_-_0_1")
    if request.method == "POST":
        abilities = request.form.getlist("myCheckbox")
        if len(abilities) == 0:
            flash("Please select at least one ability level!")
            return render_template("homePageWhite.html")
    
        session["abilities"] = abilities
        return redirect(url_for("endgameSelect"))
    return render_template("homePageWhite.html")


@app.route("/select-endgame", methods=["GET", "POST"])
def endgameSelect():
    abilities = session.get("abilities", None)
    if abilities is None:
        return redirect(url_for("home"))
    endgamePage = Endgames()
    endgames = endgamePage.fetchEndgames(abilities)
    return render_template("newRoomWhite.html", endgames=endgames, abilities=abilities)

@app.route("/play")
def playingPage():
    return render_template("playingPageWhite.html") 

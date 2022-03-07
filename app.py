from flask import Flask, render_template, request, redirect, url_for, session, flash
from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, PasswordField, BooleanField
import requests
import sqlite3
import json

app = Flask(__name__)
app.secret_key = "KJHGLKJGjglkjhskdfjsJKHGk"

class Endgames:

    def getFEN(self, name):
        conn = sqlite3.connect("database.db")
        c = conn.cursor()

        fen = c.execute("SELECT FEN FROM ENDGAMES WHERE NAME=(?)", (name,)).fetchall()

        conn.commit()
        conn.close()

        fen = str(fen[0])

        fen = fen.replace('(', '')
        fen = fen.replace(')', '')
        fen = fen.replace("'", '')
        fen = fen.replace(',', '')
        return fen


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
            
    
def fetchFromLila(fen):
    r = requests.get(f"http://tablebase.lichess.ovh/standard?fen={fen}")
    stanley = r.json()
    uciMove = stanley["moves"][0]["uci"]
    return uciMove



@app.route("/", methods=["GET", "POST"])
def home():
    s = session.get("abilities", None)
    if s is not None:
        del session["abilities"]
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
@app.route("/play/<endgameName>")
def playingPage(endgameName=None):
    if endgameName is not None:
        endgames = Endgames()
        fen = endgames.getFEN(endgameName)
        abilities = session.get("abilities", None)
        if abilities is None:
            return redirect(url_for("home"))
        endgamePage = Endgames()
        endgames = endgamePage.fetchEndgames(abilities)
        playingEndgame = []
        for i in endgames:
            if i[1] == endgameName:
                playingEndgame = i
    else:
        fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR_w_-_-_0_1"
    return render_template("playingPageWhite.html", fen=fen, playingEndgame=playingEndgame) 

@app.route("/api/nextMove", methods=["POST"])
def nextMove():
    fen = request.json["fen"]
    uciMove = fetchFromLila(fen)
    return {"a": uciMove}
    
    

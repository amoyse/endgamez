from flask import Flask, render_template, request, redirect, url_for, session, flash
from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, PasswordField, BooleanField
import requests
import sqlite3
import json
import random

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

    def getNameFromId(self, id):
        conn = sqlite3.connect("database.db")
        c = conn.cursor()

        name = c.execute("SELECT NAME FROM ENDGAMES WHERE ENDGAME_ID=(?)", (id,)).fetchall()

        conn.commit()
        conn.close()

        name = str(name[0])

        name = name.replace('(', '')
        name = name.replace(')', '')
        name = name.replace("'", '')
        name = name.replace(',', '')
        return name
            
    
def fetchFromLila(fen, starting=False):
    r = requests.get(f"http://tablebase.lichess.ovh/standard?fen={fen}")

    if r.status_code != 200:
        return {
            error: "lichess API failure"
        }

    jason = r.json() 

    if len(jason["moves"]) > 0:
        uciMove = jason["moves"][0]["uci"]
    else:
        uciMove = -1

    if starting:
        moveCount = jason["dtm"]
    else:
        if len(jason["moves"]) > 0:
            moveCount = jason["moves"][0]["dtm"]
        else:
            moveCount = 0

    return uciMove, moveCount



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

@app.route("/play/<endgameName>")
def playingPage(endgameName=None):
    if endgameName is not None:
        endgamePage = Endgames()
        if endgameName == "random":
            endgameId = random.randint(1, 12)
            endgameName = endgamePage.getNameFromId(endgameId)
            abilities = ["Beginner", "Intermediate", "Advanced"]
        else:
            abilities = session.get("abilities", None)
            if abilities is None:
                return redirect(url_for("home"))
        fen = endgamePage.getFEN(endgameName)
        uciMove, moveCount = fetchFromLila(fen, True)
        if moveCount % 2 == 0:
           moveCount = moveCount // 2
        else:
            moveCount = (moveCount // 2) + 1 
        endgames = endgamePage.fetchEndgames(abilities)
        playingEndgame = []
        for i in endgames:
            if i[1] == endgameName:
                playingEndgame = i
    else:
        fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR_w_-_-_0_1"
    return render_template("playingPageWhite.html", fen=fen, playingEndgame=playingEndgame, moveCount=moveCount) 

@app.route("/api/nextMove", methods=["POST"])
def nextMove():
    fen = request.json["fen"]
    uciMove, moveCount = fetchFromLila(fen)
    return {"a": uciMove, "b": moveCount}
    
    

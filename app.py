# Alex Moyse

from flask import Flask, render_template, request, redirect, url_for, session, flash
from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, PasswordField, BooleanField
import requests
import sqlite3
import json
import random

app = Flask(__name__)
app.secret_key = "KJHGLKJGjglkjhskdfjsJKHGk"

print("hello world")
class Endgames:

    def getFEN(self, name):
        """ This function takes the name of an Endgame position and 
            fetches the FEN stored in the database for that endgame

        Args:
            name (string): 

        Returns:
            string: the Forsyth Edwards Notation description of a position on the board
        """
        conn = sqlite3.connect("database.db") # connects to the database
        c = conn.cursor()

        fen = c.execute("SELECT FEN FROM ENDGAMES WHERE NAME=(?)", (name,)).fetchall()

        conn.commit()
        conn.close()

        fen = str(fen[0])

        # turn it into a proper readable FEN
        fen = fen.replace('(', '')
        fen = fen.replace(')', '')
        fen = fen.replace("'", '')
        fen = fen.replace(',', '')
        return fen



    def fetchEndgames(self, abilities): 
        """This function fetches a list of all the information of all the endgames 
            which are stored under that ability level in the database

        Args:
            abilities (tuple): tuple of the ability levels selected by the user 
            which they want to see endgames for

        Returns:
            2-D array: contains all the information about the selected endgames in a 2-D array
        """
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
        """Fetches the name of an endgame based on the endgame_id

        Args:
            id (int): endgame_id of an endgame position

        Returns:
            string: the name of the endgame
        """
        conn = sqlite3.connect("database.db")
        c = conn.cursor()

        name = c.execute("SELECT NAME FROM ENDGAMES WHERE ENDGAME_ID=(?)", (id,)).fetchall()

        conn.commit()
        conn.close()

        name = str(name[0])

        # turns the name into a normal string
        name = name.replace('(', '')
        name = name.replace(')', '')
        name = name.replace("'", '')
        name = name.replace(',', '')
        return name
            
    
def fetchFromLila(fen, starting=False):
    """Contacts the lichess tablebase api and fetches the best move and the 
        number of moves until mate after inputting the current position FEN

    Args:
        fen (string): the description of the current state of the board using 
        Forsyth Edwards' Notation 
        
        starting (bool, optional): Changes where the 
        method takes data from in the json file depending on if the game has 
        just started. Defaults to False.

    Returns:
        string: uciMove is a string of two square locations on the board, showing 
        where a piece should move from and to integer: moveCount is the number of 
        moves left until mate (if applicable)
    """
    r = requests.get(f"http://tablebase.lichess.ovh/standard?fen={fen}")

    # catches errors
    if r.status_code != 200:
        return {
            error: "lichess API failure"
        }

    jason = r.json() 

    # checks for stalemate, draw, lost position and won position
    if jason["category"] == "draw":
        if len(jason["moves"]) == 0:
            uciMove = "Thispositionisstalemate!!"
        else:
            uciMove = jason["moves"][0]["uci"] + "draw"
    elif len(jason["moves"]) == 0:
        uciMove = -1
    else:
        uciMove = jason["moves"][0]["uci"]

    
    # finds the number of moves until mate (if applicable)
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
    """The home route, displays the home page template

    Returns:
        template: displays the html for the home page
    """
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
    """The select-endgame route, displays the endgame selection page

    Returns:
        template: displays the html for the endgame selection page
    """
    abilities = session.get("abilities", None)
    if abilities is None:
        return redirect(url_for("home"))
    endgamePage = Endgames()
    endgames = endgamePage.fetchEndgames(abilities)
    return render_template("newRoomWhite.html", endgames=endgames, abilities=abilities)

@app.route("/play/<endgameName>")
def playingPage(endgameName=None):
    """The playing route, displays the page for playing the endgames 
        and also checks if an ability level has been selected if endgameName 
        does not equal random. Also halves the moveCount, as the api returns 
        moves until mate for both white and black whereas moves for just white are needed

    Args:
        endgameName (string, optional): the name of the endgame to be played, used to fetch 
        other information from database. Defaults to None.

    Returns:
        template: displays the html for the playing page
    """
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
    """The api between the frontend javascript code and backend python code. 
        Calls the fetchFromLila() function to get the uciMove and moveCount then 
        sends them to the frontend to be used

    Returns:
        dictionary: uciMove and moveCount contained in a small dictoinary for 
        easy retrieval of data on the frontend
    """
    fen = request.json["fen"]
    uciMove, moveCount = fetchFromLila(fen)
    return {"a": uciMove, "b": moveCount}
    

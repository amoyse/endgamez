import sqlite3

conn = sqlite3.connect("database.db")
c = conn.cursor()

c.execute(""" CREATE TABLE IF NOT EXISTS ENDGAMES (
            ENDGAME_ID        INTEGER PRIMARY KEY AUTOINCREMENT,
            NAME              TEXT NOT NULL,
            FEN               TEXT NOT NULL,
            ABILITY           TEXT NOT NULL,
            MOVES             INTEGER
            ); """)
print("Table created successfully")
import time
import random
import sqlite3
from fastapi import FastAPI 
app = FastAPI()
def init_db() :
    conn = sqlite3.connect("store.db")
    curr = conn.cursor()
    curr.execute ("""CREATE TABLE IF NOT EXISTS products(id INTEGER PRIMARY KEY, name TEXT, price REAL)""")
    
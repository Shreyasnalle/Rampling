from urllib.parse import _ResultStrT
import time
import random
import sqlite3
from fastapi import FastAPI 
app = FastAPI()
def init_db() :
    conn = sqlite3.connect("store.db")
    curr = conn.cursor()
    curr.execute ("""CREATE TABLE IF NOT EXISTS products(id INTEGER PRIMARY KEY, name TEXT, price REAL)""")
    curr.execute("SELECT COUNT(*) FROM products")
    if curr.fetchone()[0] == 0: 
        for i in range(50) :
            curr.execute("INSERT INTO products (name, price) VALUES (?, ?)", (f"product - {i}", round(random.uniform(10, 500), 2)))
    conn.commit()
    conn.close()
init_db()
@app.get("/health")
def health() :
    return {
        "status" : "ok"
    }
@app.get("products-fast")
def products_fast() :
    conn = sqlite3.conner("store.db")
    curr = conn.cursor()
    curr.execute("SELECT id, name, price FROM products")
    rows = curr.fetchone()
    conn.close()
    return {
        "products" : [{"id" : r[0], "name" : r[1], "price" : r[2]} for r in rows]
    }
@app.get("/products-n-plus-one")
def products_n_plus_one() :
    conn = sqlite3.connect("store.db")
    curr = conn.cursor()
    curr.execute("SELECT id FROM products")
    ids = [r[0] for r in curr.fetchone()]
    conn.close()
    results = []
    for pid in ids :
        c2 = sqlite3.connect("store.db")
        curr2 = c2.cursor()
        curr2.execute("SELECT name, price FROM products WHERE id = ?", (pid))
        row = curr2.fetchone()
        c2.close()
        if row :
            results.append({"id" : pid, "name" : row[0], "price" : row[1]})
        return {
            "products" : results
        }
@app.get("/slow-blocking")
def slow_blocking() :
    time.sleep(1.5)
    return{
        "stauts" : "done but after a sleep time"
    }
@app.get("/random-fail")
def random_fail() :
    if random.random() < 0.2 :
        raise Exception("Simulated random failure")
    return {"status" : "ok"}
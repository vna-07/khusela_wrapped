import sqlite3
import json
from datetime import datetime, timezone, timedelta
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "khusela.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    # Create tables based on the architecture doc
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            channel TEXT,
            sender TEXT,
            event_type TEXT,
            description TEXT,
            context TEXT,
            status TEXT,
            is_demo INTEGER
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS incidents (
            id TEXT PRIMARY KEY,
            title TEXT,
            description TEXT,
            status TEXT,
            date TEXT,
            is_demo INTEGER
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            status TEXT,
            priority TEXT
        )
    ''')
    conn.commit()
    conn.close()

# Call init_db on startup
init_db()

def get_sast_time():
    # Get UTC time and add 2 hours for South African Standard Time
    sast = datetime.now(timezone.utc) + timedelta(hours=2)
    return sast.strftime("%Y-%m-%d %H:%M:%S SAST")

def add_audit_log(channel: str, sender: str, event_type: str, description: str, context: str, status: str = "info", is_demo: bool = False):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO audit_logs (timestamp, channel, sender, event_type, description, context, status, is_demo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (get_sast_time(), channel, sender, event_type, description, context, status, 1 if is_demo else 0)
    )
    conn.commit()
    conn.close()

def get_audit_logs(is_demo: bool = False):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM audit_logs WHERE is_demo = ? ORDER BY id DESC", (1 if is_demo else 0,))
    rows = cursor.fetchall()
    conn.close()
    
    # Seed demo logs if empty
    if is_demo and len(rows) == 0:
        add_audit_log("Web Dashboard", "Thabo", "Payment Check", "Checked R2,450 proof of payment", "Verdict: WAIT · Amount mismatch", "warning", True)
        return get_audit_logs(True)
        
    return [dict(row) for row in rows]

# Update tasks and incidents similarly...
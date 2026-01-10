import sqlite3
import os

db_path = 'backend/edumanager.db'
if not os.path.exists(db_path):
    # Try alternate path if running from different CWD
    db_path = 'edumanager.db'

print(f"Connecting to {db_path}...")
try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if column exists
    cursor.execute("PRAGMA table_info(users)")
    columns = [column[1] for column in cursor.fetchall()]
    
    if 'password' not in columns:
        print("Adding 'password' column to 'users' table...")
        cursor.execute("ALTER TABLE users ADD COLUMN password VARCHAR DEFAULT 'password123'")
        conn.commit()
        print("Column added successfully.")
    else:
        print("Column 'password' already exists.")
        
    conn.close()
except Exception as e:
    print(f"Error: {e}")

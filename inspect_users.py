import sqlite3
import os

db_path = 'backend/edumanager.db'
if not os.path.exists(db_path):
    db_path = 'edumanager.db'

print(f"Checking database: {db_path}")
try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("\n--- USERS ---")
    cursor.execute("SELECT id, name, email, is_super_admin, can_generate_bulletins FROM users")
    users = cursor.fetchall()
    for u in users:
        print(u)
    
    print("\n--- ESTABLISHMENTS ---")
    cursor.execute("SELECT id, name FROM establishments")
    establishments = cursor.fetchall()
    for e in establishments:
        print(e)

    conn.close()
except Exception as e:
    print(f"Error: {e}")

import sqlite3

# Define the tables you want to wipe
TABLES_TO_CLEAN = ["logs", "alerts"]

try:
    conn = sqlite3.connect('minisiem.db')
    cursor = conn.cursor()
    
    for table in TABLES_TO_CLEAN:
        try:
            # 1. Wipe the data from the table
            cursor.execute(f"DELETE FROM {table}")
            print(f"[+] Table '{table}' cleared.")
            
            # 2. Reset the auto-increment ID counter for this table
            cursor.execute(f"DELETE FROM sqlite_sequence WHERE name='{table}'")
            print(f"[+] ID counter for '{table}' reset.")
            
        except sqlite3.OperationalError as e:
            # If sqlite_sequence doesn't exist yet, it's fine
            if "no such table: sqlite_sequence" in str(e):
                print(f"[*] Counter reset skipped for '{table}' (sequence table not yet initialized).")
            else:
                print(f"[!] Error cleaning {table}: {e}")

    conn.commit()
    print("\n--- SIEM Database Reset Complete (Users Preserved) ---")

except Exception as e:
    print(f"[!] Database Error: {e}")
finally:
    conn.close()
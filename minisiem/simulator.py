import requests
import time
import random

API_URL = "http://localhost:8000/api/logs/"

def send_log(source_ip, log_type, raw_content):
    payload = {
        "source_ip": source_ip,
        "log_type": log_type,
        "raw_content": raw_content,
        "level": "INFO"
    }
    try:
        requests.post(API_URL, json=payload)
        print(f"Sent: {raw_content[:50]}...")
    except Exception as e:
        print(f"Error sending log: {e}")

def simulate_normal_traffic():
    # SSH Login success
    send_log("192.168.1.10", "linux_auth", "Accepted password for user admin from 192.168.1.10 port 22 ssh2")
    # Web request
    send_log("192.168.1.15", "apache_access", '192.168.1.15 - - [01/Jan/2024:10:00:00 +0000] "GET /index.html HTTP/1.1" 200 1024')

def simulate_brute_force():
    target_ip = "10.0.0.50"
    print("\n--- Simulating Brute Force Attack ---")
    for _ in range(6):
        send_log(target_ip, "linux_auth", f"Failed password for invalid user root from {target_ip} port 22 ssh2")
        time.sleep(0.1)

def simulate_sql_injection():
    attacker_ip = "10.0.0.66"
    print("\n--- Simulating SQL Injection ---")
    send_log(attacker_ip, "apache_access", f'{attacker_ip} - - [01/Jan/2024:10:05:00 +0000] "GET /products?id=1 UNION SELECT 1,2,3 HTTP/1.1" 200 456')

if __name__ == "__main__":
    print("Starting simulation... (Ensure server is running on port 8000)")
    
    # Wait for server to be up manually or just start sending
    try:
        while True:
            action = random.choice(["normal", "normal", "normal", "brute", "sql"])
            if action == "normal":
                simulate_normal_traffic()
            elif action == "brute":
                simulate_brute_force()
            elif action == "sql":
                simulate_sql_injection()
            
            time.sleep(2)
    except KeyboardInterrupt:
        print("Stopping simulation.")

import re
import json
from datetime import datetime

class LogNormalizer:
    @staticmethod
    def normalize(log_type: str, raw_content: str) -> str:
        data = {}
        if log_type == "linux_auth":
            # Example SSH: "Failed password for invalid user admin from 192.168.1.100 port 22 ssh2"
            ssh_pattern = re.compile(r"Failed password for (?:invalid user )?(\w+) from (\d+\.\d+\.\d+\.\d+) port \d+ ssh2")
            match = ssh_pattern.search(raw_content)
            if match:
                data = {
                    "event": "failed_login",
                    "user": match.group(1),
                    "src_ip": match.group(2)
                }
            elif "Accepted password" in raw_content:
                data = {"event": "successful_login"} # Simplified

        elif log_type == "apache_access":
            # Example: 127.0.0.1 - - [01/Jan/2024:10:00:00 +0000] "GET /index.html HTTP/1.1" 200 1024
            apache_pattern = re.compile(r'^(\S+) \S+ \S+ \[(.*?)\] "(.*?)" (\d+) (\d+)')
            match = apache_pattern.match(raw_content)
            if match:
                 data = {
                    "src_ip": match.group(1),
                    "timestamp": match.group(2),
                    "request": match.group(3),
                    "status_code": match.group(4),
                    "size": match.group(5)
                }
        
        # Add basic defaults if empty
        if not data:
             data = {"event": "unknown_raw_log", "snippet": raw_content[:50]}

        return json.dumps(data)

normalizer = LogNormalizer()

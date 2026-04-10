cat << 'EOF' > set_network.sh
#!/bin/bash

# 1. Ask the user for the new IP
echo "Current Network Configuration Update"
read -p "Enter the Windows SIEM IP Address (e.g., 192.168.1.75): " NEW_IP

if [[ ! $NEW_IP =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "[!] Invalid IP format. Please try again."
    exit 1
fi

# 2. Define the files that need updating
FILES=("run_siem.sh" "ingestor.py")

# 3. Use sed to replace any IP-like pattern starting with http://
# This finds http:// followed by numbers and dots and replaces it with the new one
echo "[*] Updating configuration files..."

for FILE in "${FILES[@]}"; do
    if [ -f "$FILE" ]; then
        # Search for the BASE_URL pattern and swap the IP
        sed -i -E "s|http://[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+:8000|http://$NEW_IP:8000|g" "$FILE"
        echo "[+] Updated $FILE"
    else
        echo "[-] $FILE not found, skipping."
    fi
done

echo "[*] Network update complete. New target: http://$NEW_IP:8000"
EOF

# Make it executable
chmod +x set_network.sh
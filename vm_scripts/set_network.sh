#!/bin/bash

echo "------------------------------------------"
echo "   MINI-SIEM NETWORK UPDATER"
echo "------------------------------------------"
read -p "Enter the new Windows SIEM IP: " NEW_IP

if [[ ! $NEW_IP =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "[!] Invalid IP format. Exiting."
    exit 1
fi

if [ -f "ingestor.py" ]; then
    TARGET_INGESTOR="ingestor.py"
    TARGET_RUNNER="run_siem.sh"
elif [ -f "vm_scripts/ingestor.py" ]; then
    TARGET_INGESTOR="vm_scripts/ingestor.py"
    TARGET_RUNNER="vm_scripts/run_siem.sh"
else
    echo "[!] Error: Could not find ingestor.py"
    exit 1
fi

echo "[*] Applying IP $NEW_IP to scripts..."
sed -i -E "s|http://[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+:8000|http://$NEW_IP:8000|g" "$TARGET_INGESTOR"
sed -i -E "s|http://[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+:8000|http://$NEW_IP:8000|g" "$TARGET_RUNNER"
echo "[+] Success! New Target: http://$NEW_IP:8000"

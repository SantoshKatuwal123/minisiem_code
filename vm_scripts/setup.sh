#!/bin/bash

echo "[*] Preparing local environment for Mini SIEM Ingestor..."

# Update and install pip if not present
sudo apt-get update -y
sudo apt-get install -y python3-pip

# Install requests for API communication
pip3 install requests --break-system-packages

echo "[+] Setup complete."

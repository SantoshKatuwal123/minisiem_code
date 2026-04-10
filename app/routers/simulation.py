from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import random
import time
from datetime import datetime
import pytz  # Add this: pip install pytz

from .. import database, models
from ..services.normalizer import normalizer
from app.utils.security import get_current_user

router = APIRouter(
    prefix="/api/simulation",
    tags=["simulation"],
    dependencies=[Depends(get_current_user)]
)

# Global flag and configuration
simulation_running = False
current_scenario = "mixed"
simulation_stats = {
    "logs_generated": 0,
    "start_time": None,
    "scenario": "mixed"
}

class SimulationConfig(BaseModel):
    scenario: str = "mixed"
    interval: float = 2.0
    brute_force_attempts: int = 6
    auto_stop: Optional[int] = None

def get_current_timestamp():
    """Get current timestamp with timezone"""
    # Use local timezone (Nepal time UTC+5:45)
    nep_tz = pytz.timezone('Asia/Kathmandu')
    now = datetime.now(nep_tz)
    return now.strftime("%d/%b/%Y:%H:%M:%S %z")

def get_apache_timestamp():
    """Format timestamp for Apache logs"""
    nep_tz = pytz.timezone('Asia/Kathmandu')
    now = datetime.now(nep_tz)
    return now.strftime("%d/%b/%Y:%H:%M:%S %z")

@router.post("/start")
def start_simulation(
    background_tasks: BackgroundTasks, 
    config: Optional[SimulationConfig] = None,
    db: Session = Depends(database.get_db)
):
    global simulation_running, current_scenario, simulation_stats
    
    if simulation_running:
        return {"success": False, "message": "Simulation already running"}
    
    if config:
        current_scenario = config.scenario
    else:
        current_scenario = "mixed"
    
    simulation_running = True
    simulation_stats = {
        "logs_generated": 0,
        "start_time": datetime.now().isoformat(),
        "scenario": current_scenario
    }
    
    background_tasks.add_task(run_simulation, db, config)
    
    return {
        "success": True, 
        "message": f"Simulation started with {current_scenario} scenario",
        "config": {
            "scenario": current_scenario,
            "interval": config.interval if config else 2.0,
            "brute_force_attempts": config.brute_force_attempts if config else 6
        }
    }

@router.post("/stop")
def stop_simulation():
    global simulation_running
    if not simulation_running:
        return {"success": False, "message": "Simulation not running"}
    
    simulation_running = False
    return {"success": True, "message": "Simulation stopping"}

@router.get("/status")
def get_simulation_status():
    global simulation_running, simulation_stats, current_scenario
    
    return {
        "success": True, 
        "running": simulation_running,
        "scenario": current_scenario,
        "stats": simulation_stats,
        "uptime": _get_uptime() if simulation_stats.get("start_time") else 0
    }

def _get_uptime():
    if not simulation_stats.get("start_time"):
        return 0
    start = datetime.fromisoformat(simulation_stats["start_time"])
    return int((datetime.now() - start).total_seconds())

def create_log(db: Session, source_ip: str, log_type: str, raw_content: str, level: str = "INFO"):
    """Helper function to create a log entry with current timestamp"""
    global simulation_stats
    
    try:
        # The database will automatically use current timestamp
        # But we can also set it explicitly if needed
        normalized = normalizer.normalize(log_type, raw_content)
        log = models.Log(
            source_ip=source_ip,
            log_type=log_type,
            raw_content=raw_content,
            level=level,
            normalized_data=normalized
            # timestamp will be auto-set by SQLAlchemy's default=datetime.utcnow
        )
        db.add(log)
        db.commit()
        db.refresh(log)
        
        simulation_stats["logs_generated"] += 1
        
        # Print with current time for debugging
        current_time = datetime.now().strftime("%H:%M:%S")
        print(f"[SIM {current_time}] {level} - {source_ip} - {log_type}")
        
        return log
    except Exception as e:
        print(f"Error creating log: {e}")
        db.rollback()
        return None

def simulate_normal_traffic(db: Session):
    """Generate normal traffic logs with current timestamps"""
    current_time = get_current_timestamp()
    
    # SSH Login success
    create_log(db, "192.168.1.10", "linux_auth", 
              f"Accepted password for user admin from 192.168.1.10 port 22 ssh2")
    
    # Web request with current timestamp
    create_log(db, "192.168.1.15", "apache_access", 
              f'192.168.1.15 - - [{get_apache_timestamp()}] "GET /index.html HTTP/1.1" 200 1024')
    
    # Additional random normal events
    if random.random() > 0.7:
        create_log(db, "192.168.1.20", "linux_auth", 
                  f"Accepted publickey for developer from 192.168.1.20 port 22 ssh2")
    
    if random.random() > 0.8:
        create_log(db, "192.168.1.25", "apache_access", 
                  f'192.168.1.25 - - [{get_apache_timestamp()}] "GET /api/health HTTP/1.1" 200 45')

def simulate_brute_force(db: Session, attempts: int = 6):
    """Generate brute force attack simulation with current timestamps"""
    target_ip = "10.0.0.50"
    usernames = ["root", "admin", "user", "test", "ubuntu", "deploy"]
    
    for i in range(attempts):
        username = random.choice(usernames)
        create_log(db, target_ip, "linux_auth", 
                  f"Failed password for invalid user {username} from {target_ip} port {random.randint(10000, 65000)} ssh2", 
                  level="WARNING")
        if i < attempts - 1:
            time.sleep(0.1)
    
    # Sometimes add a success after brute force
    if random.random() > 0.7:
        create_log(db, target_ip, "linux_auth", 
                  f"Accepted password for user {random.choice(usernames)} from {target_ip} port 22 ssh2",
                  level="INFO")

def simulate_sql_injection(db: Session):
    """Generate SQL injection attempts with current timestamps"""
    attacker_ips = ["10.0.0.66", "10.0.0.67", "192.168.5.100"]
    attacker_ip = random.choice(attacker_ips)
    
    sql_payloads = [
        "UNION SELECT 1,2,3",
        "' OR '1'='1",
        "'; DROP TABLE users; --",
        "1 AND 1=1",
        "1' OR '1' = '1'",
        "admin' --"
    ]
    
    payload = random.choice(sql_payloads)
    create_log(db, attacker_ip, "apache_access", 
              f'{attacker_ip} - - [{get_apache_timestamp()}] "GET /products?id={payload} HTTP/1.1" 200 456',
              level="CRITICAL")

def simulate_port_scan(db: Session):
    """Generate port scan simulation"""
    scanner_ip = "10.0.0.100"
    ports = [22, 80, 443, 3306, 5432, 8080, 8443]
    
    for port in random.sample(ports, random.randint(3, 5)):
        create_log(db, scanner_ip, "firewall", 
                  f"Connection attempt to port {port} from {scanner_ip} - Potential port scan detected",
                  level="WARNING")

def simulate_malware_callback(db: Session):
    """Generate malware callback simulation"""
    infected_ip = "192.168.5.50"
    c2_servers = ["185.130.5.253", "45.155.205.233", "94.102.61.78"]
    
    create_log(db, infected_ip, "network", 
              f"Outbound connection to known malicious IP {random.choice(c2_servers)}:443 from {infected_ip}",
              level="CRITICAL")

def run_simulation(db: Session, config: Optional[SimulationConfig] = None):
    """Main simulation loop"""
    global simulation_running, current_scenario, simulation_stats
    
    if not config:
        config = SimulationConfig()
    
    scenario = config.scenario
    interval = config.interval
    brute_attempts = config.brute_force_attempts
    auto_stop = config.auto_stop
    
    start_time = time.time()
    
    print(f"[SIM] Starting simulation with scenario: {scenario} at {datetime.now()}")
    
    try:
        while simulation_running:
            if auto_stop and (time.time() - start_time) > auto_stop:
                print(f"[SIM] Auto-stopping after {auto_stop} seconds")
                simulation_running = False
                break
            
            # Select action based on scenario
            if scenario == "mixed":
                action = random.choices(
                    ["normal", "brute", "sql", "port_scan", "malware"],
                    weights=[0.5, 0.25, 0.15, 0.05, 0.05]
                )[0]
            elif scenario == "bruteforce":
                action = "brute"
            elif scenario == "sql":
                action = "sql"
            elif scenario == "portscan":
                action = "port_scan"
            elif scenario == "malware":
                action = "malware"
            else:
                action = "normal"
            
            # Execute the selected action
            if action == "normal":
                simulate_normal_traffic(db)
            elif action == "brute":
                simulate_brute_force(db, brute_attempts)
            elif action == "sql":
                simulate_sql_injection(db)
            elif action == "port_scan":
                simulate_port_scan(db)
            elif action == "malware":
                simulate_malware_callback(db)
            
            time.sleep(interval)
            
    except Exception as e:
        print(f"[SIM] Simulation error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        simulation_running = False
        print(f"[SIM] Simulation stopped. Generated {simulation_stats['logs_generated']} logs")
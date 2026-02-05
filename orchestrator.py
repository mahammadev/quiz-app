"""
Agent Relay Orchestrator
========================
Monitors relay.json and alerts you when agents swap roles.

Usage:
    python orchestrator.py

Requirements:
    - Python 3.6+
    - No external dependencies (uses built-in libraries)
"""

import json
import time
import os
import winsound
from datetime import datetime
from pathlib import Path

# Configuration
RELAY_FILE = Path(__file__).parent / "relay.json"
LOG_FILE = Path(__file__).parent / "project_log.md"
CHECK_INTERVAL = 2  # seconds between checks

# Sound frequencies (Hz) for different agents
SOUNDS = {
    "Antigravity": (800, 300),   # Higher pitch for Builder
    "OpenCode": (400, 300),      # Lower pitch for Architect
}

# ANSI colors for terminal output
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')

def read_relay():
    """Read the current state of relay.json"""
    try:
        with open(RELAY_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"{Colors.RED}Error reading relay.json: {e}{Colors.ENDC}")
        return None

def play_alert(agent_name: str):
    """Play a sound alert for the given agent"""
    if agent_name in SOUNDS:
        freq, duration = SOUNDS[agent_name]
        # Play two beeps for emphasis
        winsound.Beep(freq, duration)
        time.sleep(0.1)
        winsound.Beep(freq, duration)

def log_handoff(from_agent: str, to_agent: str, task: str):
    """Append a log entry to project_log.md"""
    timestamp = datetime.now().isoformat()
    entry = f"""
### Handoff - {timestamp}
**From:** {from_agent} → **To:** {to_agent}  
**Task:** {task}

---
"""
    try:
        with open(LOG_FILE, 'a', encoding='utf-8') as f:
            f.write(entry)
    except Exception as e:
        print(f"{Colors.YELLOW}Warning: Could not write to log: {e}{Colors.ENDC}")

def display_status(relay_data: dict):
    """Display the current relay status"""
    active = relay_data.get('active_agent', 'Unknown')
    phase = relay_data.get('phase', 'Unknown')
    task = relay_data.get('task_description', 'None')
    feedback = relay_data.get('feedback', '')
    
    # Color based on active agent
    agent_color = Colors.CYAN if active == "Antigravity" else Colors.GREEN
    
    print(f"""
{Colors.BOLD}╔══════════════════════════════════════════════════════════════╗
║                    🤖 AGENT RELAY MONITOR 🤖                   ║
╚══════════════════════════════════════════════════════════════╝{Colors.ENDC}

{Colors.BOLD}Active Agent:{Colors.ENDC} {agent_color}{active}{Colors.ENDC}
{Colors.BOLD}Phase:{Colors.ENDC}        {phase}
{Colors.BOLD}Task:{Colors.ENDC}         {task[:50]}{'...' if len(task) > 50 else ''}
{Colors.BOLD}Feedback:{Colors.ENDC}     {feedback[:50] if feedback else '(none)'}{'...' if len(feedback) > 50 else ''}

{Colors.YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{Colors.ENDC}
{Colors.BOLD}Instructions:{Colors.ENDC}
  • If Active Agent is {Colors.GREEN}OpenCode{Colors.ENDC} → Switch to OpenCode to assign a task
  • If Active Agent is {Colors.CYAN}Antigravity{Colors.ENDC} → Switch to Antigravity IDE to build
{Colors.YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{Colors.ENDC}

{Colors.HEADER}Watching for changes... (Press Ctrl+C to stop){Colors.ENDC}
""")

def main():
    """Main monitoring loop"""
    print(f"{Colors.BOLD}Starting Agent Relay Orchestrator...{Colors.ENDC}")
    print(f"Monitoring: {RELAY_FILE}")
    print()
    
    last_active_agent = None
    last_modified_time = 0
    
    try:
        while True:
            # Check if file was modified
            try:
                current_modified = os.path.getmtime(RELAY_FILE)
            except FileNotFoundError:
                print(f"{Colors.RED}relay.json not found. Waiting...{Colors.ENDC}")
                time.sleep(CHECK_INTERVAL)
                continue
            
            if current_modified != last_modified_time:
                last_modified_time = current_modified
                relay_data = read_relay()
                
                if relay_data:
                    current_agent = relay_data.get('active_agent')
                    
                    # Check if agent changed
                    if last_active_agent is not None and current_agent != last_active_agent:
                        clear_screen()
                        print(f"\n{Colors.BOLD}{Colors.YELLOW}🔔 HANDOFF DETECTED! 🔔{Colors.ENDC}\n")
                        print(f"   {last_active_agent} → {current_agent}")
                        print()
                        
                        # Play alert sound
                        play_alert(current_agent)
                        
                        # Log the handoff
                        log_handoff(
                            last_active_agent, 
                            current_agent, 
                            relay_data.get('task_description', 'N/A')
                        )
                    
                    last_active_agent = current_agent
                    
                    # Update display
                    clear_screen()
                    display_status(relay_data)
            
            time.sleep(CHECK_INTERVAL)
            
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}Orchestrator stopped.{Colors.ENDC}")

if __name__ == "__main__":
    main()

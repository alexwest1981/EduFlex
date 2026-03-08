#!/bin/bash
# EduFlex One-Click Start for Linux/WSL
# Usage: ./start.sh

# Get the absolute path of the script directory
PROJECT_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$PROJECT_ROOT"

echo "=========================================="
echo "   🎓 EduFlex LLP - One-Click Start"
echo "=========================================="
echo ""

# Check if docker is available
if ! command -v docker &> /dev/null; then
    echo "[ERROR] Docker is not installed or not in PATH."
    exit 1
fi

# Run the Bash orchestrator
if [ -f "./scripts/start_eduflex.sh" ]; then
    bash "./scripts/start_eduflex.sh"
else
    echo "[ERROR] scripts/start_eduflex.sh not found!"
    exit 1
fi

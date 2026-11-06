#!/bin/bash
# ==============================================================================
# ResQLink Full-Stack Development Server Launcher
# Launches both FastAPI Backend (:8000) and Next.js Frontend (:3001)
# ==============================================================================

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

echo "=============================================================================="
echo "  🚀 Starting ResQLink: AI Disaster Management & Route Optimization"
echo "=============================================================================="

# Ensure database is seeded
if [ ! -f "$BACKEND_DIR/disaster_platform.db" ]; then
    echo "[*] Database not detected. Seeding demo database..."
    python3 "$PROJECT_ROOT/scripts/seed_demo_database.py"
fi

# Function to stop background processes on exit
cleanup() {
    echo ""
    echo "=============================================================================="
    echo "  🛑 Shutting down ResQLink services..."
    echo "=============================================================================="
    kill $(jobs -p) 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# Start Backend API
echo "[*] Starting FastAPI Backend on http://localhost:8000 ..."
cd "$BACKEND_DIR"
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Wait briefly for backend to initialize
sleep 2

# Start Frontend App
echo "[*] Starting Next.js 14 Frontend on http://localhost:3001 ..."
cd "$FRONTEND_DIR"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "=============================================================================="
echo "  ✅ ResQLink Platform Online!"
echo "  - Frontend Web App:     http://localhost:3001"
echo "  - Backend REST API:     http://localhost:8000"
echo "  - Interactive API Docs: http://localhost:8000/api/v1/docs"
echo "  - Live GIS Map:         http://localhost:3001/map"
echo "  - AI Decision Engine:   http://localhost:3001/dashboard/admin"
echo "=============================================================================="
echo "  Press Ctrl+C to stop all services."
echo ""

wait

#!/bin/bash

BACKEND_PORT=4827
FRONTEND_PORT=6391

echo "🚀 Démarrage de RecettesScrapper"
echo "   Backend:  http://localhost:$BACKEND_PORT"
echo "   Frontend: http://localhost:$FRONTEND_PORT"

# Démarrer le backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port $BACKEND_PORT &
BACKEND_PID=$!

# Démarrer le frontend avec le port configuré dynamiquement
cd ../frontend
VITE_API_URL="http://localhost:$BACKEND_PORT" npm run dev -- --port $FRONTEND_PORT &
FRONTEND_PID=$!

# Trap pour arrêter les deux processus proprement
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT

# Attendre que l'utilisateur arrête (Ctrl+C)
wait

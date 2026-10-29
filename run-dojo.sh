#!/usr/bin/env bash
# Serve Dojo locally (macOS / Linux). Leave this window open while using the app.
cd "$(dirname "$0")"
PORT="${PORT:-4010}"
if [ ! -f dist/app.js ]; then
  echo "dist/app.js is missing. Run: npm install && npm run build"; exit 1
fi
echo "Dojo: http://localhost:$PORT/  (Ctrl+C to stop)"
( sleep 1; open "http://localhost:$PORT/" 2>/dev/null || xdg-open "http://localhost:$PORT/" 2>/dev/null ) &
exec python3 -m http.server "$PORT"

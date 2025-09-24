#!/usr/bin/env bash
# One-shot helper: fix backend .env DB_USER/DB_PASSWORD and update MySQL user to mysql_native_password
# Usage: scp scripts/fix_appdb_and_env.sh user@droplet:/tmp && ssh user@droplet 'bash /tmp/fix_appdb_and_env.sh'

set -euo pipefail

BACKEND_ENV="/home/cockpituser/gloire-road-map/backend/.env"
DBNAME_DEFAULT="gloire_road_map"

if [ ! -f "$BACKEND_ENV" ]; then
  echo "Backend .env not found at $BACKEND_ENV"
  echo "Please run this script on the droplet where the app is deployed and adjust BACKEND_ENV if needed."
  exit 2
fi

echo "This script will:"
echo "  - prompt you for the app DB password (input hidden)"
echo "  - backup $BACKEND_ENV to ${BACKEND_ENV}.bak.TIMESTAMP"
echo "  - set DB_USER=appdbuser and DB_PASSWORD='(the password you enter)' in $BACKEND_ENV"
echo "  - create/alter MySQL user appdbuser@localhost and appdbuser@127.0.0.1 to use mysql_native_password"
echo "  - grant privileges on database '${DBNAME_DEFAULT}'"
echo "  - restart pm2 process 'gloire-backend' and tail logs"
echo
read -s -p "Enter the DB password to set for appdbuser: " PW
echo
if [ -z "$PW" ]; then
  echo "No password entered; aborting."
  exit 3
fi

TS=$(date +%Y%m%d%H%M%S)
BACKUP="${BACKEND_ENV}.bak.${TS}"
cp "$BACKEND_ENV" "$BACKUP"
echo "Backed up $BACKEND_ENV -> $BACKUP"

# Helper to set or replace key in .env (adds if missing)
set_env_kv() {
  local file="$1" key="$2" val="$3"
  if grep -qE "^${key}=" "$file"; then
    # replace the line
    sed -i "s~^${key}=.*~${key}='${val}'~" "$file"
  else
    echo "${key}='${val}'" >> "$file"
  fi
}

echo "Updating $BACKEND_ENV with DB_USER=appdbuser and quoted DB_PASSWORD..."
set_env_kv "$BACKEND_ENV" "DB_USER" "appdbuser"
set_env_kv "$BACKEND_ENV" "DB_PASSWORD" "$PW"
# ensure DB_HOST is 127.0.0.1 for predictable TCP behavior
set_env_kv "$BACKEND_ENV" "DB_HOST" "127.0.0.1"

echo "Updated file (first 30 lines):"
sed -n '1,30p' "$BACKEND_ENV" || true

echo "Applying MySQL user updates (you will need sudo/root privileges)."
echo "We will run ALTER/CREATE for appdbuser@localhost and appdbuser@127.0.0.1 using mysql_native_password."

sudo mysql <<SQL || true
ALTER USER 'appdbuser'@'localhost' IDENTIFIED WITH mysql_native_password BY '${PW}';
CREATE USER IF NOT EXISTS 'appdbuser'@'127.0.0.1' IDENTIFIED WITH mysql_native_password BY '${PW}';
GRANT ALL PRIVILEGES ON \\`${DBNAME_DEFAULT}\\`.* TO 'appdbuser'@'localhost';
GRANT ALL PRIVILEGES ON \\`${DBNAME_DEFAULT}\\`.* TO 'appdbuser'@'127.0.0.1';
FLUSH PRIVILEGES;
SELECT user,host,plugin FROM mysql.user WHERE user='appdbuser';
SHOW GRANTS FOR 'appdbuser'@'localhost';
SHOW GRANTS FOR 'appdbuser'@'127.0.0.1';
SQL

echo "Restarting pm2 process 'gloire-backend'"
pm2 restart gloire-backend || pm2 start /home/cockpituser/gloire-road-map/backend/server.js --name gloire-backend

echo "Waiting 2s then tailing logs (error + out) - press Ctrl+C to stop"
sleep 2
sudo tail -n 200 /home/cockpituser/.pm2/logs/gloire-backend-error.log || true
sudo tail -n 200 /home/cockpituser/.pm2/logs/gloire-backend-out.log || true

echo "Done. If AccessDenied persists, paste the latest error log lines here and I'll iterate."

exit 0

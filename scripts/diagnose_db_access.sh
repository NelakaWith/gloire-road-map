#!/usr/bin/env bash
# Diagnostic helper for MySQL AccessDeniedError seen in backend logs.
# Usage: sudo bash scripts/diagnose_db_access.sh [path-to-backend-env]
# If no path provided the script will try a few common locations.

set -euo pipefail

probe_paths=("./backend/.env" "./.env" "$(pwd)/backend/.env" "$HOME/gloire-road-map/backend/.env" "/home/cockpituser/gloire-road-map/backend/.env")
if [ "$#" -ge 1 ]; then
  probe_paths=("$1")
fi

found_env=""
for p in "${probe_paths[@]}"; do
  if [ -f "$p" ]; then
    found_env="$p"
    break
  fi
done

if [ -z "$found_env" ]; then
  echo "No .env file found in common locations. Pass the path as the first arg. Tried:" >&2
  for p in "${probe_paths[@]}"; do echo "  $p"; done
  exit 2
fi

echo "Using .env: $found_env"

# Helper to parse key value (removes surrounding quotes and trailing inline comments)
parse_env() {
  local key="$1"
  local line
  line=$(grep -E "^${key}=" "$found_env" | sed -n '1p' || true)
  if [ -z "$line" ]; then
    echo ""
    return
  fi
  local val=${line#*=}
  val=$(echo "$val" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
  val=$(echo "$val" | sed -e 's/\s*#.*$//')
  val=$(echo "$val" | awk '{$1=$1;print}')
  echo "$val"
}

DB_USER=$(parse_env DB_USER)
DB_PASSWORD=$(parse_env DB_PASSWORD)
DB_HOST=$(parse_env DB_HOST)
DB_PORT=$(parse_env DB_PORT)
DB_NAME=$(parse_env DB_NAME)

echo "Detected DB values (password is masked):"
echo "  DB_USER: ${DB_USER:-<missing>}"
if [ -n "${DB_PASSWORD:-}" ]; then
  echo "  DB_PASSWORD: <present: ${#DB_PASSWORD} chars>"
else
  echo "  DB_PASSWORD: <missing>"
fi
echo "  DB_HOST: ${DB_HOST:-localhost}"
echo "  DB_PORT: ${DB_PORT:-3306}"
echo "  DB_NAME: ${DB_NAME:-<missing>}"

if [ -n "${DB_PASSWORD:-}" ] && echo "$DB_PASSWORD" | grep -q '#'; then
  echo "\nWARNING: DB_PASSWORD contains a '#' character. If the password in the .env has an inline comment or the file was edited with a trailing # comment, that may truncate the password. Ensure the password is quoted. Example: DB_PASSWORD='p#ssw0rd'" >&2
fi

echo "\nChecking for mysql client..."
if ! command -v mysql >/dev/null 2>&1; then
  echo "mysql client not found. Install the client (apt: mysql-client or mariadb-client) to run automatic connection tests, or run the commands below manually." >&2
  echo "Manual test (replace placeholders):"
  echo "  mysql -u ${DB_USER:-USER} -p'PASSWORD' -h ${DB_HOST:-localhost} -P ${DB_PORT:-3306} -e 'SELECT USER(), CURRENT_USER();'"
  exit 0
fi

try_connect() {
  local host="$1"
  echo "\nAttempting connection to MySQL at ${host}:${DB_PORT:-3306} as user '${DB_USER:-<missing>}'..."
  mysql --connect-timeout=5 -u"${DB_USER}" -p"${DB_PASSWORD}" -h"${host}" -P"${DB_PORT:-3306}" -e "SELECT USER(), CURRENT_USER();" 2>&1 || true
}

if [ -z "${DB_HOST}" ] || [ "$DB_HOST" = "localhost" ]; then
  try_connect "localhost" | sed 's/^/  /'
  echo "\nAlso try TCP (127.0.0.1) in case the app is connecting over TCP instead of socket:"
  try_connect "127.0.0.1" | sed 's/^/  /'
else
  try_connect "$DB_HOST" | sed 's/^/  /'
fi

echo "\nIf you see 'Access denied' errors, common fixes are:"
echo "  - Ensure DB_USER/DB_PASSWORD are correct in the .env (no stray inline comments)."
echo "  - If app connects to 'localhost' but MySQL expects socket auth, try using 127.0.0.1 in .env or create the user for 'localhost' host in MySQL."
echo "  - If the MySQL server uses 'auth_socket' or a different authentication plugin, you may need to alter the user authentication plugin or create a password-based user. See SQL snippets below."

cat <<'EOF'
SQL snippets (run as a MySQL root user on the server to create/adjust app user):

-- 1) Create user and grant privileges (replace 'REPLACE_WITH_PASSWORD')
CREATE USER IF NOT EXISTS 'appdbuser'@'localhost' IDENTIFIED BY 'REPLACE_WITH_PASSWORD';
GRANT ALL PRIVILEGES ON gloire_db.* TO 'appdbuser'@'localhost';
FLUSH PRIVILEGES;

-- 2) If you need the user to connect from 127.0.0.1 (TCP):
CREATE USER IF NOT EXISTS 'appdbuser'@'127.0.0.1' IDENTIFIED BY 'REPLACE_WITH_PASSWORD';
GRANT ALL PRIVILEGES ON gloire_db.* TO 'appdbuser'@'127.0.0.1';
FLUSH PRIVILEGES;

-- 3) If MySQL uses caching_sha2_password and your client/connector expects mysql_native_password:
ALTER USER 'appdbuser'@'localhost' IDENTIFIED WITH mysql_native_password BY 'REPLACE_WITH_PASSWORD';
FLUSH PRIVILEGES;

-- 4) To inspect the user entries and plugin:
SELECT user, host, plugin FROM mysql.user WHERE user = 'appdbuser';

EOF

echo "\nNext steps:"
echo "  - Run this script on the droplet (bash scripts/diagnose_db_access.sh /path/to/backend/.env) and paste the output here if you want me to interpret it."
echo "  - If mysql client isn't installed, install it and re-run this script or run the manual mysql command above."

exit 0
#!/usr/bin/env bash
# Diagnostic helper for MySQL AccessDeniedError seen in backend logs.
# Usage: sudo bash scripts/diagnose_db_access.sh [path-to-backend-env]
# If no path provided the script will try a few common locations.

set -euo pipefail

probe_paths=("./backend/.env" "$(pwd)/backend/.env" "$HOME/gloire-road-map/backend/.env" "/home/cockpituser/gloire-road-map/backend/.env")
if [ "$#" -ge 1 ]; then
  probe_paths=("$1")
fi

found_env=""
for p in "${probe_paths[@]}"; do
  if [ -f "$p" ]; then
    found_env="$p"
    break
  fi
done

if [ -z "$found_env" ]; then
  echo "No .env file found in common locations. Pass the path as the first arg. Tried:" >&2
  for p in "${probe_paths[@]}"; do echo "  $p"; done
  exit 2
fi

echo "Using .env: $found_env"

# Helper to parse key value (removes surrounding quotes and trailing inline comments)
parse_env() {
  local key="$1"
  # Grab the first matching line beginning with the key
  local line
  line=$(grep -E "^${key}=" "$found_env" | sed -n '1p' || true)
  if [ -z "$line" ]; then
    echo ""
    return
  fi
  # Remove key= prefix
  local val=${line#*=}
  # Remove surrounding quotes if present
  val=$(echo "$val" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
  # Remove trailing inline comment (a # and anything after)
  val=$(echo "$val" | sed -e 's/\s*#.*$//')
  # Trim whitespace
  val=$(echo "$val" | awk '{$1=$1;print}')
  echo "$val"
}

DB_USER=$(parse_env DB_USER)
DB_PASSWORD=$(parse_env DB_PASSWORD)
DB_HOST=$(parse_env DB_HOST)
DB_PORT=$(parse_env DB_PORT)
DB_NAME=$(parse_env DB_NAME)

echo "Detected DB values (password is masked):"
echo "  DB_USER: ${DB_USER:-<missing>}"
if [ -n "${DB_PASSWORD:-}" ]; then
  echo "  DB_PASSWORD: <present: ${#DB_PASSWORD} chars>"
else
  echo "  DB_PASSWORD: <missing>"
fi
echo "  DB_HOST: ${DB_HOST:-localhost}"
echo "  DB_PORT: ${DB_PORT:-3306}"
echo "  DB_NAME: ${DB_NAME:-<missing>}"

if [ -n "${DB_PASSWORD:-}" ] && echo "$DB_PASSWORD" | grep -q '#'; then
  echo "\nWARNING: DB_PASSWORD contains a '#' character. If the password in the .env has an inline comment or the file was edited with a trailing # comment, that may truncate the password. Ensure the password is quoted. Example: DB_PASSWORD='p#ssw0rd'" >&2
fi

echo "\nChecking for mysql client..."
if ! command -v mysql >/dev/null 2>&1; then
  echo "mysql client not found. Install the client (apt: mysql-client or mariadb-client) to run automatic connection tests, or run the commands below manually." >&2
  echo "Manual test (replace placeholders):"
  echo "  mysql -u ${DB_USER:-USER} -p'PASSWORD' -h ${DB_HOST:-localhost} -P ${DB_PORT:-3306} -e 'SELECT USER(), CURRENT_USER();'"
  exit 0
fi

try_connect() {
  local host="$1"
  echo "\nAttempting connection to MySQL at ${host}:${DB_PORT:-3306} as user '${DB_USER:-<missing>}'..."
  # Use --connect-timeout to avoid long waits
  mysql --connect-timeout=5 -u"${DB_USER}" -p"${DB_PASSWORD}" -h"${host}" -P"${DB_PORT:-3306}" -e "SELECT USER(), CURRENT_USER();" 2>&1 || true
}

# If DB_HOST is 'localhost', try both socket (localhost) and 127.0.0.1 (TCP)
if [ -z "${DB_HOST}" ] || [ "$DB_HOST" = "localhost" ]; then
  try_connect "localhost" | sed 's/^/  /'
  echo "\nAlso try TCP (127.0.0.1) in case the app is connecting over TCP instead of socket:"
  try_connect "127.0.0.1" | sed 's/^/  /'
else
  try_connect "$DB_HOST" | sed 's/^/  /'
fi

echo "\nIf you see 'Access denied' errors, common fixes are:"
echo "  - Ensure DB_USER/DB_PASSWORD are correct in the .env (no stray inline comments)."
echo "  - If app connects to 'localhost' but MySQL expects socket auth, try using 127.0.0.1 in .env or create the user for 'localhost' host in MySQL."
echo "  - If the MySQL server uses 'auth_socket' or a different authentication plugin, you may need to alter the user authentication plugin or create a password-based user. See SQL snippets below."

cat <<'EOF'
SQL snippets (run as a MySQL root user on the server to create/adjust app user):

-- 1) Create user and grant privileges (replace 'REPLACE_WITH_PASSWORD')
CREATE USER IF NOT EXISTS 'appdbuser'@'localhost' IDENTIFIED BY 'REPLACE_WITH_PASSWORD';
GRANT ALL PRIVILEGES ON gloire_db.* TO 'appdbuser'@'localhost';
FLUSH PRIVILEGES;

-- 2) If you need the user to connect from 127.0.0.1 (TCP):
CREATE USER IF NOT EXISTS 'appdbuser'@'127.0.0.1' IDENTIFIED BY 'REPLACE_WITH_PASSWORD';
GRANT ALL PRIVILEGES ON gloire_db.* TO 'appdbuser'@'127.0.0.1';
FLUSH PRIVILEGES;

-- 3) If MySQL uses caching_sha2_password and your client/connector expects mysql_native_password:
ALTER USER 'appdbuser'@'localhost' IDENTIFIED WITH mysql_native_password BY 'REPLACE_WITH_PASSWORD';
FLUSH PRIVILEGES;

-- 4) To inspect the user entries and plugin:
SELECT user, host, plugin FROM mysql.user WHERE user = 'appdbuser';

EOF

echo "\nNext steps:"
echo "  - Run this script on the droplet (bash scripts/diagnose_db_access.sh /path/to/backend/.env) and paste the output here if you want me to interpret it."
echo "  - If mysql client isn't installed, install it and re-run this script or run the manual mysql command above."

exit 0

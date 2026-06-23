#!/bin/sh

echo "Starting entrypoint script..."

# Check if BACKEND_URL is set
if [ -z "${BACKEND_URL}" ]; then
    echo "Warning: BACKEND_URL is not set!"
fi

echo "Runtime BACKEND_URL: ${BACKEND_URL}"

# Update config.json with current BACKEND_URL
if ! echo "{
  \"BACKEND_URL\": \"${BACKEND_URL}\"
}" > /app/public/config.json; then
    echo "Error: Failed to write to config.json"
    exit 1
fi

echo "Updated config.json content:"
cat /app/public/config.json

# Execute the main command
exec "$@"
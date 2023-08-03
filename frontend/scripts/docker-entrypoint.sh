#!/bin/bash

set -e

# Wait for the backend to be up, if we know where it is.
if [ -n "$BACKEND_HOST" ]; then
  /usr/src/app/wait-for-it.sh "$BACKEND_HOST:${BACKEND_PORT:-8080}"
fi

# Run the main container command.
exec "$@"
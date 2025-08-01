#!/usr/bin/env bash

# This script will work for mac right now, if you have NVM installed via homebrew.
# For anyone who's using another system, we might need to make updates to this to handle multiple systems.
export PATH="/opt/homebrew/bin:$PATH"
exec npx "$@"

#!/bin/bash
# Opens Metro for MODIFIED in this Terminal window. Invoked by the Xcode
# "Start Metro (auto)" build phase via `open`, so running the app from Xcode
# brings the bundler up automatically. Safe to double-click manually too.
cd "$(dirname "$0")/../.." || exit 1   # -> repo root (ios/scripts -> repo)

# Prefer the Xcode-configured node, fall back to PATH.
if [ -f "ios/.xcode.env.local" ]; then . "ios/.xcode.env.local"; fi
if [ -f "ios/.xcode.env" ]; then . "ios/.xcode.env"; fi
NODE="${NODE_BINARY:-$(command -v node)}"

clear
echo "▸ Starting Metro for MODIFIED…"
exec "$NODE" node_modules/.bin/react-native start

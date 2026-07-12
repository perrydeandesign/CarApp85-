#!/bin/sh
# Start the Metro bundler HEADLESSLY and FULLY DETACHED.
#
# Invoked by the Xcode "Start Metro (auto)" build phase on Debug builds. Unlike
# `open …command`, this never touches Terminal (so it can't trigger the macOS
# "Sandbox is not allowed to open documents in Terminal" dialog), and unlike a
# plain `nohup … &` it starts Metro in a NEW SESSION via POSIX setsid — so the
# bundler survives after the build phase / Xcode process group goes away.
#
# Logs to /tmp/modified-metro.log (override with METRO_LOG). Watch it with:
#   tail -f /tmp/modified-metro.log
#
# Safe to run manually too: ios/scripts/startMetroHeadless.sh

PORT="${RCT_METRO_PORT:-8081}"
LOG="${METRO_LOG:-/tmp/modified-metro.log}"

# Already listening? Don't start a second bundler.
if nc -w 1 -z localhost "$PORT" 2>/dev/null; then
  echo "note: Metro already running on port $PORT"
  exit 0
fi

# Repo root (this script lives in ios/scripts).
DIR="$(cd "$(dirname "$0")/../.." && pwd)" || exit 0

# Resolve node the same way React Native's own build phases do.
[ -f "$DIR/ios/.xcode.env.local" ] && . "$DIR/ios/.xcode.env.local"
[ -f "$DIR/ios/.xcode.env" ] && . "$DIR/ios/.xcode.env"
NODE="${NODE_BINARY:-$(command -v node)}"

if [ -z "$NODE" ] || [ ! -x "$NODE" ]; then
  echo "warn: node not found — start Metro manually with 'npm start'"
  exit 0
fi

cd "$DIR" || exit 0

# Launch in a brand-new session so Xcode can't reap it when the build ends.
# macOS has no `setsid` binary, so we use perl's POSIX::setsid (always present).
nohup /usr/bin/perl -e 'use POSIX qw(setsid); setsid(); exec @ARGV or die $!;' \
  "$NODE" node_modules/.bin/react-native start --port "$PORT" \
  >"$LOG" 2>&1 </dev/null &

echo "note: Metro starting headlessly in a new session (port $PORT) -> $LOG"
exit 0

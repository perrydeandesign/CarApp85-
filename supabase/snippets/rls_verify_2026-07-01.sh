#!/usr/bin/env bash
# Verify RLS enforcement on the previously-gapped tables.
# Run from repo root: bash supabase/snippets/rls_verify_2026-07-01.sh
# PASS = anon INSERT is rejected by RLS (pg code 42501).
# Uses dummy all-zero IDs so nothing is ever written even if RLS were open.
set -euo pipefail
cd "$(dirname "$0")/../.."
set -a && . ./.env && set +a
B="${SUPABASE_URL}/rest/v1"; Z="00000000-0000-0000-0000-000000000000"
H=(-H "apikey: ${SUPABASE_ANON_KEY}" -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" -H "Content-Type: application/json")

check() { # $1=table $2=json
  curl -s -o /tmp/rls_v.json -w "" --max-time 15 -X POST "$B/$1" "${H[@]}" -d "$2" || true
  code=$(python3 -c "import json;print(json.load(open('/tmp/rls_v.json')).get('code','?'))" 2>/dev/null || echo '?')
  if [ "$code" = "42501" ]; then echo "PASS  $1 (RLS blocked anon insert)"; else echo "FAIL  $1 (pg code=$code — anon insert NOT blocked by RLS)"; fi
}

check posts         "{\"profile_id\":\"$Z\",\"type\":\"t\",\"title\":\"x\",\"body\":\"y\"}"
check post_media    "{\"post_id\":\"$Z\",\"media_type\":\"image\",\"media_url\":\"x\"}"
check post_likes    "{\"post_id\":\"$Z\",\"user_id\":\"$Z\"}"
check post_comments "{\"post_id\":\"$Z\",\"author_id\":\"$Z\",\"body\":\"x\"}"

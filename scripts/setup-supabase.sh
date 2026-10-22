#!/usr/bin/env bash
# One-time Supabase setup: applies migrations, deploys import-prices, sets its secrets and
# schedules it nightly with Supabase Cron. Safe to re-run.
# Needs SUPABASE_ACCESS_TOKEN and SUPABASE_PROJECT_REF; POKEMONTCG_API_KEY is optional (without
# it pokemontcg.io allows fewer requests). Everything goes through the Management API, so no
# database password or Docker is needed.
set -euo pipefail
cd "$(dirname "$0")/.."

: "${SUPABASE_ACCESS_TOKEN:?set SUPABASE_ACCESS_TOKEN}"
: "${SUPABASE_PROJECT_REF:?set SUPABASE_PROJECT_REF}"
REF="$SUPABASE_PROJECT_REF"
SB="npx --yes supabase@latest"
API="https://api.supabase.com/v1/projects/$REF"
AUTH=(-H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" -H "Content-Type: application/json")

sql() {
  curl -sSf "${AUTH[@]}" -X POST "$API/database/query" \
    -d "$(node -e 'console.log(JSON.stringify({ query: process.argv[1] }))' "$1")"
  echo
}

echo "== Applying migrations"
# Recorded in the same table the Supabase CLI uses, so `supabase db push` agrees later.
sql "create schema if not exists supabase_migrations;
  create table if not exists supabase_migrations.schema_migrations
    (version text primary key, statements text[], name text);" >/dev/null
for f in supabase/migrations/*.sql; do
  base="$(basename "$f" .sql)"; version="${base%%_*}"; name="${base#*_}"
  if sql "select 1 from supabase_migrations.schema_migrations where version = '$version';" | grep -q '1'; then
    echo "  $base already applied"
    continue
  fi
  sql "begin; $(cat "$f")
    insert into supabase_migrations.schema_migrations (version, name) values ('$version', '$name');
    commit;" >/dev/null
  echo "  applied $base"
done

echo "== Deploying import-prices"
if [ -n "${POKEMONTCG_API_KEY:-}" ]; then
  $SB secrets set --project-ref "$REF" POKEMONTCG_API_KEY="$POKEMONTCG_API_KEY"
fi
# No JWT check so Cron can call it with a shared secret instead of the service role key.
CRON_SECRET="$(node -e 'console.log(require("crypto").randomBytes(24).toString("hex"))')"
$SB secrets set --project-ref "$REF" CRON_SECRET="$CRON_SECRET"
$SB functions deploy import-prices --project-ref "$REF" --no-verify-jwt --use-api

echo "== Scheduling nightly import (07:00 UTC)"
sql "create extension if not exists pg_cron; create extension if not exists pg_net;"
sql "select cron.unschedule(jobid) from cron.job where jobname = 'import-prices';"
sql "select cron.schedule('import-prices', '0 7 * * *', \$\$
  select net.http_post(
    url := 'https://$REF.supabase.co/functions/v1/import-prices',
    headers := jsonb_build_object('x-cron-secret', '$CRON_SECRET'),
    timeout_milliseconds := 300000
  );
\$\$);"

echo "== Running the first import now"
curl -sS -m 400 -X POST -H "x-cron-secret: $CRON_SECRET" "https://$REF.supabase.co/functions/v1/import-prices"
echo
sql "select count(*) as priced_cards from latest_prices;"

echo "== App config (put these in .env.local)"
ANON="$(curl -sSf "${AUTH[@]}" "$API/api-keys" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log(JSON.parse(s).find(k=>k.name==="anon").api_key))')"
echo "EXPO_PUBLIC_SUPABASE_URL=https://$REF.supabase.co"
echo "EXPO_PUBLIC_SUPABASE_ANON_KEY=$ANON"

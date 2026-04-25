#!/bin/bash
# Full ETL pipeline — ingests all data from 2014 to the current year.
# Safe to interrupt and re-run: all jobs are idempotent (upsert).
#
# Usage:
#   chmod +x etl_full.sh
#   nohup ./etl_full.sh &          # run in background, survives terminal close
#   tail -f etl_logs/full.log      # follow progress from another terminal

set -euo pipefail

LOGDIR="etl_logs"
LOG="$LOGDIR/full.log"
PAUSE=10        # seconds between jobs to avoid hammering the API
START_YEAR=2014
CURRENT_YEAR=$(date +%Y)

mkdir -p "$LOGDIR"

# ── Helpers ───────────────────────────────────────────────────────────────────

log() {
  local msg="[$(date '+%Y-%m-%d %H:%M:%S')] $*"
  echo "$msg"
  echo "$msg" >> "$LOG"
}

run_job() {
  local label="$1"
  shift
  log "▶ START — $label"

  if uv run python -m app.etl.runner "$@" >> "$LOG" 2>&1; then
    log "✓ DONE  — $label"
  else
    log "✗ FAILED — $label (exit $?). Continuing to next job."
  fi

  sleep "$PAUSE"
}

# ── Pipeline ──────────────────────────────────────────────────────────────────

log "════════════════════════════════════════════════════"
log "  ETL FULL  |  ${START_YEAR} → ${CURRENT_YEAR}"
log "════════════════════════════════════════════════════"

# 1. Politicians — base for all other jobs
run_job "deputies"      --only deputies
run_job "senators"      --only senators
run_job "presidents"    --only presidents
run_job "governors"     --only governors
run_job "stf-ministers" --only stf-ministers

# 2. Parliamentary expenses (CEAP) — year by year
for year in $(seq "$START_YEAR" "$CURRENT_YEAR"); do
  run_job "expenses $year" --only expenses --year "$year"
done

# 3. Votes — year by year
for year in $(seq "$START_YEAR" "$CURRENT_YEAR"); do
  run_job "votes $year" --only votes --year "$year"
done

# 4. Propositions — year by year
for year in $(seq "$START_YEAR" "$CURRENT_YEAR"); do
  run_job "propositions $year" --only propositions --year "$year"
done

# 5. Parliamentary amendments — Portal da Transparência (available from 2019)
for year in $(seq 2019 "$CURRENT_YEAR"); do
  run_job "amendments $year" --only amendments --year "$year"
done

# 6. Government credit card expenses — Portal da Transparência (available from 2019)
for year in $(seq 2019 "$CURRENT_YEAR"); do
  run_job "card-expenses $year" --only card-expenses --year "$year"
done

log "════════════════════════════════════════════════════"
log "  ETL FULL finished"
log "════════════════════════════════════════════════════"

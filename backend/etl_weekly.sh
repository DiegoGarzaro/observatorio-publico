#!/bin/bash
# Weekly ETL — refreshes only current-year data.
# Run once a week to keep the database up to date.
#
# Usage:
#   chmod +x etl_weekly.sh
#   nohup ./etl_weekly.sh &         # run in background
#   tail -f etl_logs/weekly.log     # follow progress
#
# Cron (every Sunday at 3am):
#   0 3 * * 0 cd /path/to/backend && ./etl_weekly.sh

set -euo pipefail

LOGDIR="etl_logs"
YEAR=$(date +%Y)
LOG="$LOGDIR/weekly_${YEAR}_$(date +%Y%m%d).log"
PAUSE=10

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
log "  ETL WEEKLY  |  year ${YEAR}"
log "════════════════════════════════════════════════════"

# Refresh politician list (new deputies, party changes, etc.)
run_job "deputies"   --only deputies
run_job "senators"   --only senators

# Current-year data
run_job "expenses $YEAR"     --only expenses     --year "$YEAR"
run_job "votes $YEAR"        --only votes        --year "$YEAR"
run_job "propositions $YEAR" --only propositions --year "$YEAR"
run_job "amendments $YEAR"   --only amendments   --year "$YEAR"
run_job "card-expenses $YEAR" --only card-expenses --year "$YEAR"

log "════════════════════════════════════════════════════"
log "  ETL WEEKLY finished — $(date '+%Y-%m-%d %H:%M:%S')"
log "════════════════════════════════════════════════════"

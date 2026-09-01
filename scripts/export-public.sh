#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="${1:-${ROOT}/../gc-pipeline-benchmark-public}"

rm -rf "$TARGET"
mkdir -p "$TARGET"

copy_path() {
  local source="$1"
  local destination="$2"
  mkdir -p "$(dirname "$TARGET/$destination")"
  cp -R "$ROOT/$source" "$TARGET/$destination"
}

# Explizite Allowlist: keine internen Runner, Konfigurationen, Rohdaten oder NDA-Dokumente.
copy_path "docs/API.md" "docs/API.md"
copy_path "docs/DATA_RETENTION.md" "docs/DATA_RETENTION.md"
copy_path "docs/FIELD_STUDY_01.md" "docs/FIELD_STUDY_01.md"
copy_path "docs/PRIVACY.md" "docs/PRIVACY.md"
copy_path "docs/QUALITY_SCORING.md" "docs/QUALITY_SCORING.md"
copy_path "docs/TELEMETRY.md" "docs/TELEMETRY.md"
copy_path "docs/TERMS.md" "docs/TERMS.md"
copy_path "public/benchmark" "benchmark"
copy_path "telemetry/schema.json" "telemetry/schema.json"
copy_path "telemetry/README.md" "telemetry/README.md"
copy_path "telemetry/optimization-entry.example.json" "telemetry/optimization-entry.example.json"
copy_path "package.json" "package.json"
copy_path "package-lock.json" "package-lock.json"
copy_path "LICENSE" "LICENSE"

cat > "$TARGET/README.md" <<'EOF'
# TileSmith GC-Pipeline Benchmark (Public)

Dies ist der öffentliche, reproduzierbare Teil des TileSmith Quality-Control-Frameworks. Enthalten sind Spezifikationen, synthetische Benchmark-Fixtures, Ground Truth und das Telemetrie-Schema. Die proprietäre Core-Engine, produktive Modelle und kalibrierte Tuning-Parameter werden nicht exportiert.

## Schnellstart

```bash
npm install
npm run validate
```

Weitere Informationen stehen in `docs/` und `telemetry/`.
EOF

# Sicherheitsprüfung des erzeugten Zielordners.
if find "$TARGET" -type f \( -path '*/internal/*' -o -path '*/config/*' -o -path '*/telemetry/private/*' -o -name 'SCORING_INTERNALS.md' \) | grep -q .; then
  echo "ERROR: private path found in public export" >&2
  exit 1
fi

echo "Public export created at: $TARGET"

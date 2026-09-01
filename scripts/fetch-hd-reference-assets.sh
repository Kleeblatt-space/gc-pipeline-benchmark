#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/assets/hd"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$OUT"

declare -A ASSETS=(
  [grass]=Grass001
  [stone]=Rock051
  [sand]=Ground054
  [dirt]=Ground037
  [wood]=Wood051
  [brick]=Bricks059
  [metal]=CorrugatedSteel005
  [lava]=Lava002
  [snow]=Snow002
)
for material in "${!ASSETS[@]}"; do
  id="${ASSETS[$material]}"
  zip="$TMP/${id}_1K-PNG.zip"
  dir="$TMP/$id"
  mkdir -p "$dir"
  curl --location --fail --retry 4 --retry-all-errors --silent --show-error "https://ambientcg.com/get?file=${id}_1K-PNG.zip" -o "$zip"
  unzip -q "$zip" '*_Color.png' -d "$dir"
  color="$(find "$dir" -type f -name '*_Color.png' -print -quit)"
  test -n "$color"
  cp "$color" "$OUT/$material.png"
done
cat > "$OUT/SOURCES.md" <<'EOF'
# HD reference assets

These files are separate from the active 16x16 pixel-art base set. They are 1K PNG color maps from ambientCG, downloaded from the original asset archives.

| Material | Asset | Source |
|---|---|---|
| grass | Grass001 | https://ambientcg.com/a/Grass001 |
| stone | Rock051 | https://ambientcg.com/a/Rock051 |
| sand | Ground054 | https://ambientcg.com/a/Ground054 |
| dirt | Ground037 | https://ambientcg.com/a/Ground037 |
| wood | Wood051 | https://ambientcg.com/a/Wood051 |
| brick | Bricks059 | https://ambientcg.com/a/Bricks059 |
| metal | CorrugatedSteel005 | https://ambientcg.com/a/CorrugatedSteel005 |
| lava | Lava002 | https://ambientcg.com/a/Lava002 |
| snow | Snow002 | https://ambientcg.com/a/Snow002 |

All downloadable ambientCG assets are provided under CC0 according to https://docs.ambientcg.com/license/.
Water002, CorrugatedIron001 and Sand002 from the original notes were unavailable at download time; replacements are explicitly named above rather than silently substituted.
EOF
echo "downloaded ${#ASSETS[@]} HD reference assets to $OUT"

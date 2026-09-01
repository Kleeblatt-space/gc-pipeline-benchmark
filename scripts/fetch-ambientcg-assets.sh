#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/assets/base/1024x1024"
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
  echo "Downloading $id"
  curl -L --fail --silent --show-error "https://ambientcg.com/get?file=${id}_1K-PNG.zip" -o "$zip"
  unzip -q "$zip" '*_Color.png' -d "$dir"
  color="$(find "$dir" -type f -name '*_Color.png' -print -quit)"
  test -n "$color"
  cp "$color" "$OUT/$material.png"
done

cat > "$OUT/SOURCES.md" <<'EOF'
# HD base assets

These 1K PNG color maps were downloaded from ambientCG on the date of generation. ambientCG states that its downloadable assets are available under the Creative Commons CC0 1.0 Universal License.

| Material | Asset ID | Source |
|---|---|---|
| grass | Grass001 | https://ambientcg.com/a/Grass001 |
| stone | Rock051 | https://ambientcg.com/a/Rock051 |
| sand | Ground054 (replacement for unavailable Sand002) | https://ambientcg.com/a/Ground054 |
| dirt | Ground037 | https://ambientcg.com/a/Ground037 |
| wood | Wood051 | https://ambientcg.com/a/Wood051 |
| brick | Bricks059 | https://ambientcg.com/a/Bricks059 |
| metal | CorrugatedSteel005 (replacement for unavailable CorrugatedIron001) | https://ambientcg.com/a/CorrugatedSteel005 |
| water | Not downloaded: Water002 returned 404 and no verified replacement was selected |
| lava | Lava002 | https://ambientcg.com/a/Lava002 |
| snow | Snow002 | https://ambientcg.com/a/Snow002 |

License: https://docs.ambientcg.com/license/
EOF

echo "Downloaded ${#ASSETS[@]} AmbientCG color maps to $OUT"

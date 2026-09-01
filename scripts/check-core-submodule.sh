#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CORE="$ROOT/tilefix-core"

if [[ ! -f "$ROOT/.gitmodules" || ! -d "$CORE/.git" && ! -f "$CORE/.git" ]]; then
  echo "ERROR: tilefix-core is not initialized. Run: git submodule update --init --recursive" >&2
  exit 1
fi

commit="$(git -C "$CORE" rev-parse HEAD)"
branch="$(git -C "$CORE" symbolic-ref --short -q HEAD || echo detached)"
for entry in tilefix-core.js src/tilefix-core-v2.5.js package.json; do
  test -e "$CORE/$entry" || { echo "ERROR: missing core entrypoint: $entry" >&2; exit 1; }
done

echo "TileFixFireflyDoctor submodule ready"
echo "  commit: $commit"
echo "  branch: $branch"
echo "  remote: $(git -C "$CORE" remote get-url origin)"

#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MAESTRO_BIN="${HOME}/.maestro/bin/maestro"

if [[ -x "$MAESTRO_BIN" ]]; then
  exec "$MAESTRO_BIN" test "${ROOT_DIR}/.maestro" "$@"
fi

if command -v maestro >/dev/null 2>&1; then
  exec maestro test "${ROOT_DIR}/.maestro" "$@"
fi

echo "Maestro not found. Install: curl -Ls https://get.maestro.mobile.dev | bash" >&2
exit 127

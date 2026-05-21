#!/usr/bin/env bash
set -euo pipefail

PYTHON_VERSION="3.11"
VENV_DIR="backend/.venv"

echo "==> Checking Homebrew..."
if ! command -v brew &>/dev/null; then
  echo "Homebrew not found. Installing..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

echo "==> Installing Python ${PYTHON_VERSION} via Homebrew..."
brew install python@${PYTHON_VERSION}

PYTHON_BIN="$(brew --prefix)/bin/python${PYTHON_VERSION}"

if [[ ! -x "$PYTHON_BIN" ]]; then
  echo "Error: python${PYTHON_VERSION} not found at ${PYTHON_BIN}" >&2
  exit 1
fi

echo "==> Creating virtual environment at ${VENV_DIR} using $($PYTHON_BIN --version)..."
"$PYTHON_BIN" -m venv "$VENV_DIR"

echo "==> Installing backend dependencies..."
"${VENV_DIR}/bin/pip" install --upgrade pip
"${VENV_DIR}/bin/pip" install -r backend/requirements.txt

echo ""
echo "Setup complete!"
echo ""
echo "To start the backend:"
echo "  source ${VENV_DIR}/bin/activate"
echo "  uvicorn backend.main:app --reload"

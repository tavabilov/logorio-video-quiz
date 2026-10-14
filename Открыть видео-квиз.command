#!/bin/zsh
cd "$(dirname "$0")" || exit 1
export PATH="$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"
if curl -fsS http://127.0.0.1:4173/api/quiz >/dev/null 2>&1; then
  open http://127.0.0.1:4173
  exit 0
fi
if ! command -v node >/dev/null; then
  echo 'Для запуска нужен Node.js версии 24 или новее.'
  read -r
  exit 1
fi
if [[ ! -d node_modules ]]; then
  npm install || exit 1
fi
(sleep 2; open http://127.0.0.1:4173) &
node server.mjs

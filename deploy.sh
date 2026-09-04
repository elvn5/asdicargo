#!/usr/bin/env bash
# Релиз AsDi Cargo — выполняется на сервере (deploy.yml по SSH; можно и руками
# из каталога деплоя). Идемпотентен: применяются только новые миграции.
#
# Обязательно: IMAGE_TAG (staging | X.Y.Z).
# Для приватных образов GHCR: GHCR_USER, GHCR_TOKEN.
set -euo pipefail
cd "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[ -f .env ] && chmod 600 .env || true   # секьюрим env на сервере

IMAGE_PREFIX="ghcr.io/elvn5/asdicargo"
COMPOSE_FILE="docker-compose.deploy.yml"
: "${IMAGE_TAG:?IMAGE_TAG не задан}"
export IMAGE_PREFIX IMAGE_TAG
compose() { docker compose -f "$COMPOSE_FILE" "$@"; }

echo "▶ Деплой ${IMAGE_PREFIX} @ ${IMAGE_TAG}"

# Логин в GHCR (для приватных образов)
if [[ -n "${GHCR_TOKEN:-}" ]]; then
  echo "${GHCR_TOKEN}" | docker login ghcr.io -u "${GHCR_USER:?GHCR_USER не задан}" --password-stdin
  trap 'docker logout ghcr.io >/dev/null 2>&1 || true' EXIT
fi

compose pull
compose up -d --wait postgres
echo "▶ Миграции БД"
compose run --rm -w /repo api \
  node apps/api/node_modules/typeorm/cli.js migration:run \
  -d packages/database/dist/data-source.js
compose up -d --remove-orphans
docker image prune -f
echo "✔ Готово"
compose ps

#!/usr/bin/env bash

set -euo pipefail

project_name="kadha-product-demo"
compose_files=(-f docker-compose.yml -f docker-compose.demo.yml)
export KADHA_DEMO_UID="$(id -u)"
export KADHA_DEMO_GID="$(id -g)"

mkdir -p demo/output

cleanup() {
  docker compose --project-name "$project_name" "${compose_files[@]}" down --remove-orphans >/dev/null 2>&1 || true
}

trap cleanup EXIT

docker compose --project-name "$project_name" "${compose_files[@]}" up --build --abort-on-container-exit --exit-code-from demo demo
node demo/src/render.mjs

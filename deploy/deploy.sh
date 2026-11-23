#!/usr/bin/env bash
# Runs on the server. The CI deploy key is locked to this script in
# ~/.ssh/authorized_keys (command="..."), so that key can do nothing else.
# Usage over SSH: the command sent is the image tag (a git commit SHA).
# Manual use / rollback: ./deploy.sh <commit-sha>   (or "latest")
set -euo pipefail
cd "$(dirname "$0")"

TAG="${SSH_ORIGINAL_COMMAND:-${1:-latest}}"
if [[ ! "$TAG" =~ ^([0-9a-f]{40}|latest)$ ]]; then
  echo "refusing: invalid image tag '$TAG'" >&2
  exit 1
fi

export IMAGE_TAG="$TAG"
docker compose pull --quiet
docker compose up -d --wait --wait-timeout 60
echo "$TAG" > .deployed-tag
docker image prune -f --filter "until=168h" >/dev/null
echo "deployed ghcr.io/astricus/cv:$TAG"

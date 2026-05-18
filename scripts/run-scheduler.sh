#!/usr/bin/env sh

set -eu

echo "Running Laravel scheduler tick..."
exec php artisan schedule:run --no-interaction --verbose

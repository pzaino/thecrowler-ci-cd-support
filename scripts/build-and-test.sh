#!/bin/bash

# Build:
echo "Building Docker image..."
docker build -t crowler-validation-action . 

# Test:
echo "Running tests..."
#docker run --rm -v "$(pwd)/tests:/tests" crowler-validation-action '/tests/rules/*' 

docker run --rm \
  -v "$(pwd)/tests/rules:/workspace/rules" \
  -v "$(pwd)/tests/plugins:/workspace/plugins" \
  crowler-validation-action '/workspace/rules/*'
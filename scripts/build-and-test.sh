#!/bin/bash

# Build:
echo "Building Docker image..."
docker build -t crowler-validation-action . 

# Test:
echo "Running tests..."
docker run --rm -v "$(pwd)/tests:/tests" crowler-validation-action '/tests/*' 

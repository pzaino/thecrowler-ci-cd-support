# Use the official Python image
FROM python:3.8-slim

# Install required Python packages
RUN pip install jsonschema pyyaml requests

# Set the working directory
WORKDIR /workspace

# Copy validation script
COPY validate_crowler_logic.py /validate_crowler_logic.py

# Create and copy schemas directory
RUN mkdir -p /workspace/schemas
COPY schemas /workspace/schemas  

# Set entrypoint
ENTRYPOINT ["python", "/validate_crowler_logic.py"]

FROM python:3.8-slim

# Install Node.js (v18) and other tools
RUN apt-get update && \
    apt-get install -y curl gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install required Python packages
RUN pip install jsonschema pyyaml requests

# Set working directory
WORKDIR /workspace

# Copy validation script
COPY validate_crowler_logic.py /validate_crowler_logic.py

# Copy schema files
COPY schemas /workspace/schemas  

# Copy JS syntax checker and install dependencies
COPY package.json /package.json
COPY check-js-syntax.js /check-js-syntax.js
RUN npm install

# Entrypoint still runs the Python script
ENTRYPOINT ["python", "/validate_crowler_logic.py"]

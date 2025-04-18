import json
import yaml
import argparse
import subprocess
import os
import glob
from jsonschema import validate, ValidationError, SchemaError

import requests

SCHEMA_URLS = {
    "ruleset": "https://raw.githubusercontent.com/pzaino/thecrowler/main/schemas/ruleset-schema.json",
    "config": "https://raw.githubusercontent.com/pzaino/thecrowler/main/schemas/crowler-config-schema.json",
    "event": "https://raw.githubusercontent.com/pzaino/thecrowler/main/schemas/crowler-event-schema.json",
    "agent": "https://raw.githubusercontent.com/pzaino/thecrowler/main/schemas/crowler-agent-schema.json",
    "source": "https://raw.githubusercontent.com/pzaino/thecrowler/main/schemas/source-config-schema.json",
}

# Define paths to JSON schemas
SCHEMA_DIR = "./schemas"
SCHEMAS = {
    "ruleset": "./schemas/ruleset-schema.json",
    "config": "./schemas/crowler-config-schema.json",
    "event": "./schemas/crowler-event-schema.json",
    "agent": "./schemas/crowler-agent-schema.json",
    "source": "./schemas/source-config-schema.json",
}

def fetch_schemas():
    """Ensure schema directory exists and download schemas if missing."""
    os.makedirs(SCHEMA_DIR, exist_ok=True)

    for name, url in SCHEMA_URLS.items():
        schema_path = f"{SCHEMA_DIR}/{name}-schema.json"

        # If schema file is missing, download it
        if not os.path.exists(schema_path):
            try:
                response = requests.get(url, timeout=5)
                if response.status_code == 200:
                    with open(schema_path, "w") as f:
                        f.write(response.text)
                    print(f"Downloaded {name}-schema.json")
                else:
                    print(f"Warning: Could not download {name}-schema.json (HTTP {response.status_code}).")
            except requests.RequestException:
                print(f"Warning: Network issue. Cannot fetch {name}-schema.json.")

def load_yaml_or_json(file_path):
    """ Load JSON or YAML data from a file """
    try:
        with open(file_path, "r", encoding="utf-8") as file:
            if file_path.endswith((".yaml", ".yml")):
                return yaml.safe_load(file)
            elif file_path.endswith(".json"):
                return json.load(file)
            else:
                print(f"❌ Unsupported file format: {file_path}")
                return None
    except (json.JSONDecodeError, yaml.YAMLError) as e:
        print(f"❌ Invalid JSON/YAML in {file_path}: {e}")
        return None

def validate_json(data, schema_file, file_name):
    """ Validate JSON/YAML data against a given JSON schema """
    try:
        with open(schema_file, "r", encoding="utf-8") as schema_file:
            schema = json.load(schema_file)
        validate(instance=data, schema=schema)
        print(f"Validation successful: {file_name} is valid!")
    except ValidationError as e:
        print(f"Validation Error in {file_name}: {e.message}")
        print(f"Path: {' -> '.join(map(str, e.path)) if e.path else 'Root'}")
        exit(1)  # Exit with error to fail the CI/CD pipeline
    except SchemaError as e:
        print(f"Schema Error in {file_name}: {e.message}")
        exit(1)

def detect_schema_type(data):
    """ Detect the type of schema based on JSON/YAML properties """
    if isinstance(data, dict):
        if "ruleset_name" in data:
            return "ruleset"
        elif "database" in data or "crawler" in data:
            return "config"
        elif "event_type" in data and "details" in data:
            return "event"
        elif "jobs" in data:
            return "agent"
        elif "source_name" in data:
            return "source"
    return None

def run_js_syntax_check():
    if os.path.isdir('plugins'):
        print("🔍 Running JavaScript syntax validation for plugins/...")
        try:
            subprocess.run(['npm', 'run', 'check-js-syntax'], check=True)
        except subprocess.CalledProcessError as e:
            print("❌ JavaScript syntax validation failed.")
            exit(1)

def main():
    parser = argparse.ArgumentParser(description="Validate CROWler JSON/YAML files against their schemas")
    parser.add_argument("files", nargs="+", help="Paths to JSON or YAML files to validate")  # Accepts multiple arguments
    args = parser.parse_args()

    file_list = []
    for item in args.files:
        for file in item.split(","):  # Split by commas if needed
            cleaned_file = file.strip()
            if not cleaned_file:
                continue

            # Support for Wildcards (e.g., "/tests/*.json")
            expanded_files = glob.glob(cleaned_file, recursive=True)  # Expand wildcards
            if expanded_files:
                file_list.extend(expanded_files)
            elif os.path.isdir(cleaned_file):  # Support for Directories
                for root, _, files in os.walk(cleaned_file):
                    for f in files:
                        if f.endswith((".json", ".yaml", ".yml")):  # Only validate YAML/JSON files
                            file_list.append(os.path.join(root, f))
            else:
                file_list.append(cleaned_file)  # Normal file

    # Remove duplicates
    file_list = list(set(file_list))

    if not file_list:
        exit(run_js_syntax_check())

    fetch_schemas()

    for file in file_list:
        data = load_yaml_or_json(file)
        if not data:
            exit(1)  # Exit if file couldn't be loaded

        schema_type = detect_schema_type(data)
        if not schema_type:
            print(f"Could not determine schema type for {file}. Please check structure.")
            exit(1)

        schema_file = SCHEMAS.get(schema_type)
        print(f"Detected schema type: {schema_type} for {file}")

        validate_json(data, schema_file, file)

    # Run JavaScript syntax check if plugins directory exists
    run_js_syntax_check()

if __name__ == "__main__":
    main()

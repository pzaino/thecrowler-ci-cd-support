import json
import pyyaml
import argparse
import os
from jsonschema import validate, ValidationError, SchemaError

# Define paths to JSON schemas
SCHEMAS = {
    "ruleset": "ruleset-schema.json",
    "config": "crowler-config-schema.json",
    "event": "crowler-event-schema.json",
    "agent": "crowler-agent-schema.json",
    "source": "source-config-schema.json",
}

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
        print(f"✅ Validation successful: {file_name} is valid!")
    except ValidationError as e:
        print(f"❌ Validation Error in {file_name}: {e.message}")
        print(f"Path: {' -> '.join(map(str, e.path)) if e.path else 'Root'}")
        exit(1)  # Exit with error to fail the CI/CD pipeline
    except SchemaError as e:
        print(f"❌ Schema Error in {file_name}: {e.message}")
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

def main():
    parser = argparse.ArgumentParser(description="Validate CROWler JSON/YAML files against their schemas")
    parser.add_argument("files", nargs="+", help="Paths to JSON or YAML files to validate")
    args = parser.parse_args()

    for file in args.files:
        data = load_yaml_or_json(file)
        if not data:
            exit(1)  # Exit if file couldn't be loaded

        schema_type = detect_schema_type(data)
        if not schema_type:
            print(f"❌ Could not determine schema type for {file}. Please check structure.")
            exit(1)

        schema_file = SCHEMAS.get(schema_type)
        print(f"🔍 Detected schema type: {schema_type} for {file}")

        validate_json(data, schema_file, file)

if __name__ == "__main__":
    main()

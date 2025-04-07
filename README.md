# The CROWler CI/CD SUpport

## Introduction

The CROWler CI/CD Support is a set of tools and scripts that help you to automate the testing of your applications based on the CROWler framework. It is based on the [CROWler](https://github.com/pzaino/thecrowler) project, which is a powerful Content Discovery Development Platform.

## Features

The CROWler CI/CD Support provides the following features:

- **Automated Logic Validation**: The CROWler CI/CD Support can automatically validate the logic of your CROWler configuration, rules, events, agents and more.
- **Auto-detection of correct JS Standard for engine, event and vdi plugins**: The CROWler CI/CD Support can automatically detect the correct JavaScript standard for your engine, event and VDI plugins. So it can verify their syntax correctly (ES 5.1 for ebgine and event plugins, ES 6 for VDI plugins).

## Usage on GitHub Actions

Just create an action as this one (in your .github/workflows/crowler-validate.yml):

```yaml
---
name: Test CROWler Validation Action

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  validate:
    name: Validate CROWler Rulesets, Agents & Configs
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v3

      - name: Expand Wildcards & Run CROWler Validation
        run: |
          FILES=$(find rules agents -type f \( -name "*.yaml" -o -name "*.yml" -o -name "*.json" \) | tr '\n' ',')
          echo "Validating files: $FILES"
          echo "FILES=$FILES" >> $GITHUB_ENV

      - name: Run CROWler Validation Action
        uses: pzaino/thecrowler-ci-cd-support@v1.0.1
        with:
          files: "${{ env.FILES }}"
```

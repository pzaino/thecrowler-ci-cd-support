import fs from 'fs';
import { parse } from 'acorn';
import { globSync } from 'glob';

const files = globSync("**/plugins/**/*.js", { nodir: true });

if (files.length === 0) {
  console.log("⚠️  No JavaScript files found under ./plugins/.");
  process.exit(0);
}

console.log(`🔍 Found ${files.length} JavaScript file(s) to validate:`);

let hasErrors = false;

function safelyParse(content, ecmaVersion, filePath) {
  try {
    parse(content, { ecmaVersion });
    return true;
  } catch (err) {
    // Retry: wrap top-level return with dummy function
    if (/^\s*return\s*\(/m.test(content)) {
      console.warn(`⚠️  ${filePath} - Top-level return detected. Wrapping in dummy function...`);
      try {
        const wrapped = `(function __validate__wrapper__() {\n${content}\n})();`;
        parse(wrapped, { ecmaVersion });
        console.log(`🔁 ${filePath} - parsed successfully with wrapper workaround.`);
        return true;
      } catch (innerErr) {
        console.error(`❌ ${filePath} - Still invalid after wrapping:\n${innerErr.message}`);
      }
    } else {
      console.error(`❌ ${filePath} - Syntax error:\n${err.message}`);
    }
    return false;
  }
}


files.forEach((file) => {
  console.log(`🔸 Validating: ${file}`);
  const content = fs.readFileSync(file, 'utf8');
  const header = content.split('\n').slice(0, 5).join('\n');
  let ecmaVersion = 5;
  let isVDIPlugin = false;

  if (/type:\s*vdi_plugin/.test(header)) {
    ecmaVersion = 6;
    isVDIPlugin = true;
  }

  // Enforce VDI plugin structure: must return an IIFE
  if (isVDIPlugin && !/return\s*\(function\s*\w*\s*\(/.test(content)) {
    console.error(`❌ ${file} - VDI plugin must return a self-invoking function (IIFE)`);
    hasErrors = true;
    return;
  }

  const valid = safelyParse(content, ecmaVersion, file);
  if (valid) {
    console.log(`✅ ${file} - valid ES${ecmaVersion}`);
  } else {
    hasErrors = true;
  }
});

if (hasErrors) {
  console.error("🚫 Syntax errors or structure violations detected in one or more files.");
  process.exit(1);
} else {
  console.log("🎉 All files passed syntax and structure validation.");
}

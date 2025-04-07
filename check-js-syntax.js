import fs from 'fs';
import acorn from 'acorn';
import glob from 'glob';

const files = glob.sync("plugins/**/*.js");

if (files.length === 0) {
  console.log("No JavaScript files found.");
  process.exit(0);
}

let hasErrors = false;

files.forEach((file) => {
  const content = fs.readFileSync(file, 'utf8');
  const header = content.split('\n').slice(0, 5).join('\n');
  let ecmaVersion = 5;

  if (/type:\s*vdi_plugin/.test(header)) {
    ecmaVersion = 6;
  }

  try {
    acorn.parse(content, { ecmaVersion });
    console.log(`✅ ${file} - valid ES${ecmaVersion}`);
  } catch (err) {
    console.error(`❌ ${file} - Syntax error (ES${ecmaVersion}):\n${err.message}`);
    hasErrors = true;
  }
});

if (hasErrors) {
  process.exit(1);
}

import fs from 'fs';
import { parse } from 'acorn';
import { globSync } from 'glob';

//console.log(`📂 CWD: ${process.cwd()}`);
//console.log(`📂 Contents:`);
//console.log(fs.readdirSync(process.cwd(), { withFileTypes: true }).map(f => `${f.isDirectory() ? '[DIR] ' : '[FILE]'} ${f.name}`).join('\n'));

//const files = globSync("plugins/**/*.js");
const files = globSync("**/plugins/**/*.js", { nodir: true });

if (files.length === 0) {
  console.log("⚠️  No JavaScript files found under ./plugins/");
  process.exit(0);
}

console.log(`🔍 Found ${files.length} JavaScript file(s) to validate:`);

let hasErrors = false;

files.forEach((file) => {
  console.log(`🔸 Validating: ${file}`);
  const content = fs.readFileSync(file, 'utf8');
  const header = content.split('\n').slice(0, 5).join('\n');
  let ecmaVersion = 5;

  if (/type:\s*vdi_plugin/.test(header)) {
    ecmaVersion = 6;
  }

  try {
    parse(content, { ecmaVersion });
    console.log(`✅ ${file} - valid ES${ecmaVersion}`);
  } catch (err) {
    console.error(`❌ ${file} - Syntax error (ES${ecmaVersion}):\n${err.message}`);
    hasErrors = true;
  }
});

if (hasErrors) {
  console.error("🚫 Syntax errors detected in one or more files.");
  process.exit(1);
} else {
  console.log("🎉 All files passed syntax validation.");
}

const fs = require('fs');
const path = require('path');

const locales = ['nl', 'en'];
const files = ['common.json', 'forms.json', 'marketing.json'];

function flattenKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && !Array.isArray(obj[key]) && obj[key] !== null) {
      keys = keys.concat(flattenKeys(obj[key], newKey));
    } else {
      keys.push(newKey);
    }
  }
  return keys;
}

let errors = 0;
let warnings = 0;

console.log('\n🔍 Checking i18n translations...\n');

files.forEach(file => {
  console.log(`📄 Checking ${file}...`);
  const translations = {};

  locales.forEach(locale => {
    const filePath = path.join(__dirname, '..', 'locales', locale, file);
    if (fs.existsSync(filePath)) {
      try {
        translations[locale] = flattenKeys(JSON.parse(fs.readFileSync(filePath, 'utf8')));
      } catch (err) {
        console.error(`   ❌ ERROR: Failed to parse ${locale}/${file}: ${err.message}`);
        errors++;
        return;
      }
    } else {
      console.error(`   ❌ ERROR: Missing ${locale}/${file}`);
      errors++;
      return;
    }
  });

  // Check key parity between NL and EN
  const nlKeys = translations['nl'] || [];
  const enKeys = translations['en'] || [];

  const missingInEN = nlKeys.filter(key => !enKeys.includes(key));
  const extraInEN = enKeys.filter(key => !nlKeys.includes(key));

  if (missingInEN.length > 0) {
    console.error(`   ❌ Missing EN translations (${missingInEN.length}):`);
    missingInEN.forEach(key => console.error(`      - ${key}`));
    errors += missingInEN.length;
  }

  if (extraInEN.length > 0) {
    console.warn(`   ⚠️  Extra EN translations (${extraInEN.length}):`);
    extraInEN.forEach(key => console.warn(`      - ${key}`));
    warnings += extraInEN.length;
  }

  if (missingInEN.length === 0 && extraInEN.length === 0) {
    console.log(`   ✅ All translations match (${nlKeys.length} keys)`);
  }

  console.log('');
});

console.log('━'.repeat(60));
console.log(`\nSummary:`);
console.log(`  ✅ Completed checks`);
console.log(`  ❌ Errors: ${errors}`);
console.log(`  ⚠️  Warnings: ${warnings}\n`);

if (errors > 0) {
  console.error('❌ Translation check FAILED\n');
  process.exit(1);
} else {
  console.log('✅ All translations are complete!\n');
  process.exit(0);
}

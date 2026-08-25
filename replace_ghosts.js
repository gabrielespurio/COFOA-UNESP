const fs = require('fs');
const path = require('path');

const replacements = {
  'var(--color-danger)': 'var(--color-error)',
  'var(--color-gray-50)': 'var(--color-surface-alt)',
  'var(--color-gray-200)': 'var(--color-border)',
  'var(--color-gray-300)': 'var(--color-text-muted)',
  'var(--color-text-tertiary)': 'var(--color-text-muted)',
  'var(--font-size-xs)': 'var(--text-xs)',
  'var(--font-size-sm)': 'var(--text-sm)',
  'var(--font-size-md)': 'var(--text-base)',
  'var(--font-size-lg)': 'var(--text-lg)',
  'var(--font-size-xl)': 'var(--text-xl)',
  'var(--font-size-2xl)': 'var(--text-2xl)',
  'var(--font-weight-medium)': '500',
  'var(--font-weight-bold)': '700',
  'var(--line-height-relaxed)': '1.6',
  'var(--spacing-xs)': 'var(--space-2)',
  'var(--spacing-sm)': 'var(--space-4)',
  'var(--spacing-md)': 'var(--space-6)',
  'var(--spacing-lg)': 'var(--space-8)',
  'var(--spacing-xl)': 'var(--space-12)',
  'var(--spacing-2xl)': 'var(--space-16)',
  'var(--spacing-3xl)': 'var(--space-20)'
};

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walkDir(file));
    } else { 
      if (file.endsWith('.css')) results.push(file);
    }
  });
  return results;
}

const files = walkDir(path.join(__dirname, 'src'));

let changedFiles = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;
  
  for (const [key, value] of Object.entries(replacements)) {
    newContent = newContent.split(key).join(value);
  }
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    changedFiles++;
    console.log(`Updated ${file}`);
  }
});

console.log(`Total files changed: ${changedFiles}`);

// Usage: node scripts/seed.js [--remote]
const { spawnSync } = require('node:child_process')

const target = process.argv.includes('--remote') ? '--remote' : '--local'
const res = spawnSync(
  'npx',
  ['wrangler', 'd1', 'execute', 'trendiverse-db', target, '--file=migrations/0002_seed.sql'],
  { stdio: 'inherit' }
)
process.exit(res.status ?? 1)

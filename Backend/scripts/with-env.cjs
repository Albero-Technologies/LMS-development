#!/usr/bin/env node
// Loads the project's `.env.development` / `.env.production` / `.env`
// via dotenv-flow (same loader the runtime uses), then spawns whatever
// command was passed on the rest of argv. Lets us run prisma CLI commands
// that read DATABASE_URL etc. without each developer manually exporting
// vars or maintaining a separate `.env` symlink.
//
// Usage:
//   node scripts/with-env.cjs prisma migrate deploy
//   node scripts/with-env.cjs prisma studio
//
// NODE_ENV defaults to development when unset so dotenv-flow pulls
// `.env.development` overrides; pass `NODE_ENV=production npm run …` to
// load `.env.production` instead.

if (!process.env.NODE_ENV) process.env.NODE_ENV = 'development'

const path = require('node:path')

require('dotenv-flow').config({ path: path.resolve(__dirname, '..'), silent: false })

const { spawnSync } = require('node:child_process')

const [, , cmd, ...rest] = process.argv
if (!cmd) {
    console.error('Usage: node scripts/with-env.cjs <command> [...args]')
    process.exit(2)
}

// Prepend node_modules/.bin to PATH so locally-installed binaries (prisma,
// vitest, …) resolve without needing `npx`. shell:true lets the OS pick the
// right Windows .cmd shim or POSIX symlink automatically.
const localBin = path.resolve(__dirname, '..', 'node_modules', '.bin')
const env = { ...process.env }
const pathKey = process.platform === 'win32' ? Object.keys(env).find((k) => k.toLowerCase() === 'path') ?? 'Path' : 'PATH'
env[pathKey] = `${localBin}${path.delimiter}${env[pathKey] ?? ''}`

const result = spawnSync(cmd, rest, {
    stdio: 'inherit',
    shell: true,
    cwd: path.resolve(__dirname, '..'),
    env
})

if (result.error) {
    console.error(result.error.message)
    process.exit(1)
}
process.exit(result.status ?? 0)

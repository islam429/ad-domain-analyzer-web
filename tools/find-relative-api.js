#!/usr/bin/env node

/* eslint-disable no-console */
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..', 'web')
const SKIP_DIRS = new Set(['node_modules', '.next', 'dist', 'build', '.turbo', '.git'])
const TEXT_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.json',
  '.md',
  '.css',
  '.scss',
  '.sass',
  '.html',
])

const PATTERN = /(fetch|new\s+Request)\((['"])\/api\//
const matches = []

function isTextFile(filename) {
  const ext = path.extname(filename).toLowerCase()
  return TEXT_EXTENSIONS.has(ext)
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) {
        walk(path.join(dir, entry.name))
      }
      continue
    }
    const filePath = path.join(dir, entry.name)
    if (!isTextFile(filePath)) continue

    let content
    try {
      content = fs.readFileSync(filePath, 'utf8')
    } catch {
      continue
    }

    const lines = content.split(/\r?\n/)
    lines.forEach((line, idx) => {
      if (PATTERN.test(line)) {
        matches.push({ filePath, lineNumber: idx + 1, line: line.trim() })
      }
    })
  }
}

if (!fs.existsSync(ROOT)) {
  console.error(`web/ directory not found at ${ROOT}`)
  process.exit(2)
}

walk(ROOT)

if (matches.length === 0) {
  console.log('No relative /api fetches found.')
  process.exit(0)
}

console.error('Relative /api fetch calls detected:')
for (const match of matches) {
  console.error(`${path.relative(ROOT, match.filePath)}:${match.lineNumber} ${match.line}`)
}
process.exit(1)

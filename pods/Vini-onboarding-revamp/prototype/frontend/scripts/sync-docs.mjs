#!/usr/bin/env node
// Sync the customer signal + PRD into frontend/public/docs so they ship with
// the Vercel deployment. Runs automatically before `dev` and `build`.
//
// Source-of-truth files live one level up from prototype/:
//   ../../signal-onboarding-revamp.md
//   ../../prd-onboarding-revamp.md
//
// We copy them so the live SPA can `fetch('/docs/<file>.md')` and render.

import { copyFileSync, mkdirSync, statSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const FRONTEND_ROOT = resolve(here, '..')
const POD_ROOT = resolve(FRONTEND_ROOT, '..', '..')
const PUBLIC_DOCS = resolve(FRONTEND_ROOT, 'public', 'docs')

mkdirSync(PUBLIC_DOCS, { recursive: true })

const targets = [
  { src: resolve(POD_ROOT, 'signal-onboarding-revamp.md'), dst: resolve(PUBLIC_DOCS, 'signal-onboarding-revamp.md') },
  { src: resolve(POD_ROOT, 'prd-onboarding-revamp.md'),    dst: resolve(PUBLIC_DOCS, 'prd-onboarding-revamp.md') },
]

let copied = 0
let missing = 0
for (const { src, dst } of targets) {
  try {
    statSync(src)
    copyFileSync(src, dst)
    copied += 1
    console.log(`✓ docs: ${src.replace(POD_ROOT + '/', '')}  →  public/docs/`)
  } catch {
    missing += 1
    console.warn(`⚠ docs: missing ${src} — skipping`)
  }
}

// Tiny manifest so the SPA can list docs without hard-coding names.
const manifest = {
  generated_at: new Date().toISOString(),
  docs: [
    { id: 'signal', title: 'Customer Signal',  path: '/docs/signal-onboarding-revamp.md' },
    { id: 'prd',    title: 'PRD (Phase 1)',    path: '/docs/prd-onboarding-revamp.md' },
  ],
}
writeFileSync(resolve(PUBLIC_DOCS, 'manifest.json'), JSON.stringify(manifest, null, 2))

console.log(`docs sync: ${copied} copied, ${missing} missing`)

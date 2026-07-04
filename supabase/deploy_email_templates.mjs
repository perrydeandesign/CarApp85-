// Deploys the MODIFIED auth email templates to the hosted Supabase project via
// the Management API (PATCH /v1/projects/{ref}/config/auth).
//
// Usage:
//   SUPABASE_ACCESS_TOKEN="$(cat /tmp/sb_token)" \
//   SUPABASE_PROJECT_REF=ingjymkrefdhrkiievby \
//   node supabase/deploy_email_templates.mjs
//
// The token is a Supabase Personal Access Token. It is read from the env only,
// never written to disk or logged. Revoke it after use.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const REF = process.env.SUPABASE_PROJECT_REF || 'ingjymkrefdhrkiievby';
if (!TOKEN) {
  console.error('Missing SUPABASE_ACCESS_TOKEN. Aborting.');
  process.exit(1);
}

const emailsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'brand', 'emails');

// Supabase auth email templates use Go templating; our footer support links use
// ESP-style {{support_url}}, which isn't valid there — swap for a real mailto.
function loadAuth(file) {
  return readFileSync(join(emailsDir, file), 'utf8')
    .replaceAll('{{support_url}}', 'mailto:support@modified.app');
}

// Map: Supabase config field -> our file + subject line.
const templates = {
  confirmation: { file: 'confirm-signup.html',    subject: 'Confirm your email — MODIFIED' },
  magic_link:   { file: 'magic-link.html',         subject: 'Your MODIFIED sign-in link' },
  recovery:     { file: 'reset-password.html',      subject: 'Reset your MODIFIED password' },
  email_change: { file: 'change-email.html',        subject: 'Confirm your new email — MODIFIED' },
  reauthentication: { file: 'reauthentication.html', subject: 'Your MODIFIED verification code' },
};

const body = {};
for (const [key, { file, subject }] of Object.entries(templates)) {
  body[`mailer_subjects_${key}`] = subject;
  body[`mailer_templates_${key}_content`] = loadAuth(file);
}

const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/config/auth`, {
  method: 'PATCH',
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(body),
});

if (!res.ok) {
  console.error(`Deploy failed: HTTP ${res.status}`);
  console.error(await res.text());
  process.exit(1);
}
console.log('✓ Deployed 5 auth email templates to project', REF);
console.log('  View: Dashboard → Authentication → Email Templates');

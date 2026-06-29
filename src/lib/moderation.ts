// Content moderation for user-submitted text.
//
// Scope: hate speech, racial / ethnic slurs, sex-/gender-based slurs,
// homophobic / transphobic slurs, threats, and the most common harassment
// patterns. This is a deterministic word-list filter — it is intentionally
// conservative (favours false positives over letting a slur through).
//
// Surface usage:
//   const { ok, reason } = checkText(input);
//   if (!ok) showError(reason);          // block submit
//
// The banned terms are stored base64-encoded so they don't appear as
// plaintext in the source. Add new entries with `btoa('term')` (JS) or
// `Buffer.from('term').toString('base64')` (Node).

// ---- Encoded blocklist (categorised) -------------------------------------
// Each entry is base64 of the lowercase root. Common leet substitutions and
// punctuation between letters are normalised before matching, so "n!gger",
// "n.i.g.g.e.r", "n1gg3r" all collapse to the root.
const ENCODED: Record<string, string[]> = {
  racial: [
    'bmlnZ2Vy', 'bmlnZ2E=', 'Y2hpbms=', 'Z29vaw==', 'a2lrZQ==',
    'c3BpYw==', 'd2V0YmFjaw==', 'dG93ZWxoZWFk', 'cmFnaGVhZA==',
    'amlnYWJvbw==', 'cG9yY2htb25rZXk=', 'Y29vbg==',
  ],
  sexist: [
    'Yml0Y2g=', 'YyoqdA==', 'Y3VudA==', 'd2hvcmU=', 'c2x1dA==',
    'dGhvdA==', 'aG9l',
  ],
  homophobic: [
    'ZmFnZ290', 'ZmFn', 'dHJhbm55', 'ZHlrZQ==', 'aG9tbw==',
    'cXVlZXI=', // contextual — keep in list because the request was inclusive
  ],
  ableist: [
    'cmV0YXJk', 'cmV0YXJkZWQ=',
  ],
  threats: [
    'a2lsbHlvdXJzZWxm', 'a3lz', // common harassment shorthand
    'aGFuZ3lvdXJzZWxm',
  ],
};

function decode(b64: string): string {
  // RN ships atob in modern runtimes; fall back to Buffer for Node tests.
  if (typeof atob === 'function') return atob(b64);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return Buffer.from(b64, 'base64').toString('utf8');
}

const BANNED: { category: string; root: string }[] = [];
for (const [category, list] of Object.entries(ENCODED)) {
  for (const enc of list) BANNED.push({ category, root: decode(enc).toLowerCase() });
}

// ---- Normalisation --------------------------------------------------------
// Collapses leet, punctuation, and repeated chars so obvious bypasses are
// caught. Conservative: short tokens (< 3 chars) aren't matched to avoid
// false-positives on initials.
const LEET_MAP: Record<string, string> = {
  '0': 'o', '1': 'i', '!': 'i', '|': 'i',
  '3': 'e', '4': 'a', '@': 'a',
  '5': 's', '$': 's', '7': 't',
};

function normalize(text: string): string {
  const lowered = String(text || '').toLowerCase();
  // Replace leet chars, then strip everything that isn't a letter.
  // This collapses "n.i.g.g.e.r", "n!gg3r", and "n i g g e r" to "nigger".
  let buf = '';
  for (const ch of lowered) {
    const sub = LEET_MAP[ch] ?? ch;
    if (/[a-z]/.test(sub)) buf += sub;
  }
  // Collapse 3+ repeated letters → 2 (so "niiiigger" → "niigger") then to 1.
  buf = buf.replace(/(.)\1{2,}/g, '$1$1');
  return buf;
}

// ---- Public API -----------------------------------------------------------
export type ModerationResult =
  | { ok: true }
  | { ok: false; reason: string; category: string; matched: string };

/**
 * Returns { ok: true } if the text is clean, or { ok: false, reason, category }
 * if it contains a banned term. UI should display `reason` and block submit.
 */
export function checkText(text: string): ModerationResult {
  if (!text || !text.trim()) return { ok: true };
  const collapsed = normalize(text);
  // Also keep a word-broken form so we can do whole-word checks on short roots.
  const tokenised = String(text || '')
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter(Boolean)
    .join(' ');

  for (const { category, root } of BANNED) {
    if (root.length < 3) continue;
    // Whole-word on the raw text, substring on the collapsed form.
    const wordRe = new RegExp(`(^|\\s)${root}(\\s|$)`);
    if (wordRe.test(tokenised) || collapsed.includes(root)) {
      return {
        ok: false,
        category,
        matched: root,
        reason: messageFor(category),
      };
    }
  }
  return { ok: true };
}

/** Convenience: replace any matched term with asterisks. */
export function sanitize(text: string): string {
  let out = String(text || '');
  const collapsed = normalize(text);
  for (const { root } of BANNED) {
    if (root.length < 3) continue;
    if (collapsed.includes(root)) {
      const re = new RegExp(root, 'gi');
      out = out.replace(re, '*'.repeat(root.length));
    }
  }
  return out;
}

function messageFor(category: string): string {
  switch (category) {
    case 'racial':     return 'Racist language isn’t allowed on MODIFIED.';
    case 'sexist':     return 'Sexist or misogynistic language isn’t allowed.';
    case 'homophobic': return 'Homophobic or transphobic language isn’t allowed.';
    case 'ableist':    return 'Ableist slurs aren’t allowed.';
    case 'threats':    return 'Threats or self-harm talk aren’t allowed. Reach out — help is available.';
    default:           return 'This message contains language that isn’t allowed.';
  }
}

/** True if any banned term is present. Quick boolean for places that don't need a reason. */
export function containsBanned(text: string): boolean {
  return !checkText(text).ok;
}

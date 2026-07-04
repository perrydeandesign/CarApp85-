# MODIFIED — Transactional Email System

A complete, on-brand set of HTML emails for every message the app can send.
Designed dark-first to match the app: teal `#00C9A7` on charcoal `#0D1117`,
geometric wordmark, motorsport restraint. Built to render everywhere —
table-based layout, fully inline CSS, bulletproof (VML) buttons for Outlook,
600px body, and dark-mode-safe colors.

## Design tokens

| Token | Hex | Use |
|-------|-----|-----|
| Canvas | `#05070A` | Outer background |
| Card | `#0D1117` | Content panel |
| Card raised | `#161B22` | Inset boxes (codes, receipts) |
| Border | `#1E2630` | Hairlines / dividers |
| Teal (accent) | `#00C9A7` | Buttons, links, wordmark |
| Teal bright | `#3BE8CC` | Gradient top / hover |
| On-accent | `#04110E` | Text on teal buttons (WCAG-safe) |
| Text | `#F0F6FC` | Headings / primary copy |
| Text muted | `#C9D1D9` | Body copy |
| Text faint | `#8B949E` | Footer / legal |
| Danger | `#F87171` | Security / destructive |

Type stack (email-safe): `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
Helvetica, Arial, sans-serif`. Headings 700–800, tight tracking on the wordmark.

## The emails

### Supabase Auth (paste into Dashboard → Authentication → Email Templates)
These use Supabase's Go template variables (`{{ .ConfirmationURL }}` etc.).

| File | Supabase template | When it fires |
|------|-------------------|---------------|
| `confirm-signup.html` | Confirm signup | New email/password account |
| `magic-link.html` | Magic Link | Passwordless sign-in |
| `reset-password.html` | Reset Password | "Forgot password" |
| `change-email.html` | Change Email Address | User changes their email |
| `reauthentication.html` | Reauthentication | OTP for a sensitive action |

### Product / lifecycle (send via your ESP — Resend, Postmark, SES…)
These use `{{handlebars}}` placeholders you fill at send time.

| File | When it fires |
|------|---------------|
| `welcome.html` | First successful sign-in / after verification |
| `security-alert.html` | New-device or new-location sign-in |
| `data-export-ready.html` | The data-export job finishes (edge function) |
| `account-deleted.html` | Account deletion completes |
| `report-received.html` | User submits a report (receipt + outcome) |
| `weekly-digest.html` | Weekly engagement / competition roundup |

## Placeholders

Supabase: `{{ .ConfirmationURL }}`, `{{ .Token }}`, `{{ .SiteURL }}`,
`{{ .Email }}`, `{{ .NewEmail }}`.

Product (fill via your ESP): `{{username}}`, `{{action_url}}`, `{{device}}`,
`{{location}}`, `{{ip}}`, `{{time}}`, `{{download_url}}`, `{{expiry}}`,
`{{report_status}}`, `{{support_url}}`, `{{unsubscribe_url}}`,
`{{preferences_url}}`, plus digest fields (`{{new_followers}}`, `{{likes}}`,
`{{comments}}`, `{{top_post_image}}`, …).

## Install

**Auth emails:** Supabase Dashboard → Authentication → Email Templates → pick the
template → paste the matching file's HTML → Save. Set a verified custom SMTP
sender (Settings → Auth → SMTP) so mail comes from `no-reply@modified.app` with
`MODIFIED` as the display name (default Supabase SMTP is rate-limited and
unbranded).

**Product emails:** upload the HTML to your ESP as templates and pass the
placeholders at send time. Point the data-export + account-deletion edge
functions at the ESP.

## Logo

The header uses a bulletproof text wordmark (no image dependency). To use the
graphic logo instead, host `brand/exports/wordmark-min.svg.png` (or export a
dedicated 2x email logo) at a public URL and swap the header `<span>` for an
`<img src="…" alt="MODIFIED" height="28">`. Always keep the `alt` text.

## Testing

Preview locally by opening any file in a browser. Before shipping, run one
through Litmus/Email on Acid (or send test copies to Gmail, Apple Mail, and
Outlook) — Outlook is the reason for the VML button blocks.

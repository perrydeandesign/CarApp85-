# Email auth — full setup (sign-up verify + password reset)

The app now implements **code-based (OTP) email flows** — no magic-link deep
linking, which is the most reliable approach on mobile and fully testable in-app.

## App flows (already built)
- **Sign up** (`Signup.tsx`) → `signUp()`; if email confirmation is on, routes to
  **VerifyEmail** (`src/screens/Auth/OtpScreens.tsx`) → user enters the 6-digit
  code → `verifyOtp({type:'signup'})` → session created → into the app.
- **Forgot password** (`Login.tsx`) → `resetPasswordForEmail()` → **ResetPassword**
  screen → code + new password → `verifyOtp({type:'recovery'})` + `updateUser({password})`
  → signed in.
- Both screens have "Resend code".

## Supabase dashboard config (REQUIRED — this is why email "doesn't work" today)

1. **Custom SMTP** — Authentication → Emails → **SMTP Settings** → enable and add a
   provider (Resend / Postmark / SendGrid / AWS SES; all have free tiers). The
   built-in email service is rate-limited to a few messages/hour project-wide and
   often doesn't deliver — this is the #1 fix.

2. **Email templates** — Authentication → Emails → **Templates**:
   - **Confirm signup** → paste `supabase/templates/confirm-signup.html`
   - **Reset password** → paste `supabase/templates/reset-password.html`
   Both now render the 6-digit code via `{{ .Token }}` (the link still works too).

3. **Enable confirmations** — Authentication → Providers → **Email** → turn ON
   "Confirm email" so new signups must verify. (If left OFF, signUp auto-signs-in
   and the app skips the VerifyEmail step — it handles both.)

4. **Rate limits** — Authentication → **Rate Limits** → make sure the email rate
   isn't near zero.

5. **OTP expiry** — Authentication → Providers → Email → "Email OTP Expiration":
   default 3600s (60 min) is fine.

No **Redirect URLs** are needed — the OTP flow uses codes, not deep links.

## Testing notes
- Test with a **real inbox that has an account**. `resetPasswordForEmail` returns
  success even for unknown emails (anti-enumeration), so "Check your email" showing
  doesn't prove delivery — check Authentication → **Logs**.
- After SMTP is configured, do one end-to-end pass: sign up → enter code → land in
  app; then forgot password → enter code + new password → signed in.

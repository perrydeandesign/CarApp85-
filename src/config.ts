/**
 * App-wide runtime config flags.
 */

/**
 * When true, the app skips the login gate and resolves "me" to the first seeded
 * profile (investor/demo mode). Flip to `false` to require a real Supabase login
 * — the full auth path (Login → session → Main) is wired and ready.
 *
 * Either way, real auth WORKS: if a Supabase session exists, the app attributes
 * everything to the logged-in user (see useMeProfile). This flag only controls
 * whether the login screen is enforced.
 */
export const SKIP_AUTH = true;

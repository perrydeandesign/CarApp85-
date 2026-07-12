# Push Notifications — Setup (remaining native + backend steps)

Status as of 2026-07-09: the **app-side seam is fully wired** and the **DB layer is
ready**. What's missing is the native transport (Firebase/APNs) and a send-side
function — all of which need your Firebase + Apple accounts. This doc is the
exact checklist to finish it. Nothing here is done automatically.

## What's already in place (no action)
- `src/lib/push.ts` — `registerForPush()`, `registerDeviceToken()`,
  `unregisterForPush()`, `unregisterDeviceToken()`, `shouldDisplayNotification()`.
  `acquireDeviceToken()` returns `null` today, so everything is a safe no-op until
  a transport is installed.
- **Call sites are wired** (`src/auth/useAuth.ts`): `registerForPush()` runs on
  `SIGNED_IN` / existing session, `unregisterForPush()` on `SIGNED_OUT`.
- `device_tokens` table **exists on the live DB** (verified) with columns
  `user_id, token, platform`. RLS should be confirmed (owner can upsert/delete own).
- `src/lib/notificationPolicy.ts` — master switch, per-category prefs, quiet hours;
  `shouldDisplayNotification()` already consults it before displaying a push.
- In-app notifications already generate via DB triggers
  (`supabase/snippets/notification_triggers_2026-07-09.sql`). Push is just the
  transport that mirrors those to the OS.

---

## Step 1 — Firebase project + APNs key (your accounts)
1. Firebase console → **Add project** (or reuse an existing one).
2. **Add iOS app** with the real bundle ID (must match the shipping bundle ID —
   see the launch-blocker about `com.yourcompany.CarAppClean.CarAppClean`).
3. Download **`GoogleService-Info.plist`** → place in `ios/` and add it to the
   Xcode target (Copy Bundle Resources). **Do not commit it** (add to `.gitignore`).
4. Apple Developer → Keys → **create an APNs Auth Key (.p8)**. Note the Key ID +
   Team ID.
5. Firebase → Project Settings → **Cloud Messaging** → upload the `.p8` APNs key.

## Step 2 — Install the native transport
```bash
npm i @react-native-firebase/app @react-native-firebase/messaging
cd ios && pod install && cd ..
```
(These are intentionally NOT in `package.json` yet — adding them forces a native
rebuild, so install them only when you're ready to do Step 3–4 in one pass.)

## Step 3 — Xcode capabilities
In Xcode → target → Signing & Capabilities → **+ Capability**:
- **Push Notifications**
- **Background Modes** → check **Remote notifications**

This creates/updates `CarAppClean.entitlements` (the project currently has **no**
entitlements file — this is the step that adds one).

## Step 4 — Fill in `acquireDeviceToken()`
In `src/lib/push.ts`, replace the stub body with:
```ts
import messaging from '@react-native-firebase/messaging';

async function acquireDeviceToken(): Promise<string | null> {
  const authStatus = await messaging().requestPermission();
  const ok =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  if (!ok) return null;
  return await messaging().getToken();
}
```
Also add a token-refresh listener (tokens rotate) — e.g. in `useAuth`:
```ts
messaging().onTokenRefresh((t) => { void registerDeviceToken(t); });
```
That's the entire client change — `registerForPush()` already calls
`acquireDeviceToken()` + `registerDeviceToken()`.

## Step 5 — Foreground / tap handling (optional but recommended)
- Foreground: `messaging().onMessage(...)` → gate display with
  `shouldDisplayNotification(category)` (already exported), display via a local
  notifier (e.g. `@notifee/react-native`).
- Tap: `messaging().onNotificationOpenedApp(...)` +
  `getInitialNotification()` → route via `src/navigation/linking.ts`
  (the `modified://` scheme is already registered).

## Step 6 — Send-side: mirror `notifications` rows to push
The DB triggers already insert into `public.notifications`. Add a
**Supabase Database Webhook** (Dashboard → Database → Webhooks) on
`INSERT` of `public.notifications` → HTTP POST to a new `send-push` edge function.

`supabase/functions/send-push/index.ts` (sketch — FCM HTTP v1):
```ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// Use a Firebase service-account JSON (store as the FIREBASE_SA secret) to mint
// an OAuth token for the FCM HTTP v1 endpoint.

Deno.serve(async (req) => {
  const { record } = await req.json();          // the new notifications row
  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  // 1. tokens for the recipient
  const { data: toks } = await admin
    .from('device_tokens').select('token').eq('user_id', record.profile_id);
  if (!toks?.length) return new Response('no tokens', { status: 200 });

  // 2. actor name for the body
  const { data: actor } = await admin
    .from('profiles').select('username').eq('id', record.actor_id).maybeSingle();

  const title = 'MODIFIED';
  const body = `${actor?.username ?? 'Someone'} ${
    record.type === 'like' ? 'liked your post'
    : record.type === 'comment' ? 'commented on your post'
    : record.type === 'follow' ? 'started following you'
    : record.type === 'mention' ? 'mentioned you'
    : 'sent you a notification'}`;

  // 3. POST to FCM v1 for each token (mint OAuth token from FIREBASE_SA first)
  //    https://fcm.googleapis.com/v1/projects/<project-id>/messages:send
  //    { message: { token, notification: { title, body }, data: { type: record.type } } }

  return new Response('ok', { status: 200 });
});
```
Deploy: `supabase functions deploy send-push --use-api` (Docker isn't running →
must use `--use-api`). Set secrets: `supabase secrets set FIREBASE_SA=@sa.json`.

Optional refinement: have `send-push` honor per-user prefs server-side (the same
categories as `notificationPolicy`) before sending, and prune dead tokens when
FCM returns `UNREGISTERED`.

## Step 7 — Test (device only, NOT simulator)
1. Run on a real device, log in → confirm a `device_tokens` row appears.
2. From a second account, like/follow/comment on the first account's content.
3. Confirm the push arrives and the tap routes correctly.

---

### Env / secrets summary
| Where | Key | Purpose |
|---|---|---|
| `ios/GoogleService-Info.plist` | — | Firebase iOS config (git-ignored) |
| Firebase Cloud Messaging | APNs `.p8` | Apple push transport |
| Supabase function secret | `FIREBASE_SA` | Service account for FCM v1 OAuth |

### Effort estimate
~half a day once the Firebase project + APNs key exist: Steps 2–4 are ~1 hour,
Step 6 (send function) is the bulk. All app-side plumbing is already done.

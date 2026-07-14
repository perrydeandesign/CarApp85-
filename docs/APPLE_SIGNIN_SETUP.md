# Sign in with Apple — activation

The **code is fully wired** (`src/auth/appleAuth.ts` + `src/screens/Login.tsx`).
The button is hidden until the native capability + credentials are in place —
`isAppleConfigured()` gates it, so there's never a dead button (App Review 2.1).
Once the steps below are done, the "Continue with Apple" button appears
automatically and works end-to-end.

## 1. Install the native pod
Already added to `package.json` (`@invertase/react-native-apple-authentication`).
Link the iOS pod:
```
cd ios && pod install
```

## 2. Xcode capability
Target **CarAppClean → Signing & Capabilities → + Capability → Sign in with Apple**.
This creates/updates the entitlements file with
`com.apple.developer.applesignin = ["Default"]`. Make sure a real bundle id and
team are selected (not the placeholder `com.yourcompany.CarAppClean`).

## 3. Apple Developer portal
- Enable **Sign in with Apple** on the App ID.
- Create a **Services ID** (used as the OAuth `client_id` for Supabase).
- Create a **Sign in with Apple key** (.p8) and note the **Key ID** and **Team ID**.

## 4. Supabase → Authentication → Providers → Apple
Enable Apple and fill in:
- **Services ID** (client id)
- **Team ID**
- **Key ID**
- **.p8 private key** contents

Supabase generates the client secret (JWT) from these. Add the Supabase callback
URL to the Services ID's **Return URLs** if using web redirect (native token flow
below does not require it).

## 5. How the flow works (native token exchange)
`signInWithApple()` runs the native Apple sheet, gets the `identityToken`, and
calls `supabase.auth.signInWithIdToken({ provider: 'apple', token })`. No web
redirect. AppNavigator swaps to the main app once the session updates.

## Follow-up hardening (optional)
Add a nonce: generate a random string, SHA-256 it, pass the hash as
`appleAuth.performRequest({ nonce })`, and pass the raw nonce to
`signInWithIdToken({ ..., nonce })`. Requires a SHA-256 (e.g. `expo-crypto` or
`react-native-quick-crypto`). Current no-nonce flow is valid and works; nonce
adds replay protection.

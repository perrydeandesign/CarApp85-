import { supabase } from '../lib/supabase';

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signUpWithEmail(
  email: string,
  password: string,
  username?: string,
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: username ? { data: { username } } : undefined,
  });
  if (error) throw error;
  return data;
}

/** Send a password-reset email. With a token-based template the email carries a
 *  6-digit code the user enters on the Reset Password screen (see verifyRecoveryOtp). */
export async function sendPasswordReset(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
  return data;
}

/** Verify a signup email with the 6-digit code from the confirmation email.
 *  On success Supabase returns a session → the user is signed in. */
export async function verifyEmailOtp(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({ email, token: token.trim(), type: 'signup' });
  if (error) throw error;
  return data;
}

/** Re-send the signup confirmation code. */
export async function resendSignupOtp(email: string) {
  const { error } = await supabase.auth.resend({ type: 'signup', email });
  if (error) throw error;
}

/** Verify a password-reset code. On success the user holds a recovery session,
 *  so updatePassword() can then set the new password. */
export async function verifyRecoveryOtp(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({ email, token: token.trim(), type: 'recovery' });
  if (error) throw error;
  return data;
}

/** Set a new password for the currently-authenticated (or recovery) session. */
export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Permanently delete the signed-in user's account (App Store 5.1.1(v)).
 * Calls the `delete-account` edge function (service-role removes the auth
 * user + owned data + storage), then clears the local session.
 */
export async function deleteAccount() {
  const { error } = await supabase.functions.invoke('delete-account', {
    method: 'POST',
  });
  if (error) throw error;
  // Clear the local session; AppNavigator swaps back to the auth flow.
  await supabase.auth.signOut();
}

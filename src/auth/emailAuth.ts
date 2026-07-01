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

export async function sendPasswordReset(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
  return data;
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

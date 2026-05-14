export function validatePassword(password: string): string | null {
  if (password.length < 8) return 'error.passwordMinLength';
  if (!/[a-zA-Z]/.test(password)) return 'error.passwordNeedsLetter';
  if (!/[0-9]/.test(password)) return 'error.passwordNeedsNumber';
  return null;
}

export function validateEmail(email: string): string | null {
  if (!email) return 'auth.emailRequired';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'auth.emailInvalid';
  return null;
}

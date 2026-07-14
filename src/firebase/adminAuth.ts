/**
 * Lightweight password check for the admin page.
 *
 * IMPORTANT: This is obscurity, not real security. A motivated attacker can
 * read the hash from your bundle. For a production-grade secret, use Firebase
 * Auth. This implementation is appropriate for a portfolio / personal site.
 *
 * The expected hash is provided as a SHA-256 hex digest via the env var
 * VITE_ADMIN_PASSWORD_HASH. Generate one with:
 *
 *   node -e "console.log(require('crypto').createHash('sha256').update('yourPassword').digest('hex'))"
 */

const SALT = "gwa-calc-admin-v1";

const sha256Hex = async (input: string): Promise<string> => {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

export const checkAdminPassword = async (password: string): Promise<boolean> => {
  const expected = import.meta.env.VITE_ADMIN_PASSWORD_HASH as
    | string
    | undefined;
  if (!expected) return false;

  const actual = await sha256Hex(`${SALT}:${password}`);
  // Constant-time comparison to prevent timing side-channels
  if (actual.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < actual.length; i++) {
    diff |= actual.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
};
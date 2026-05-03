/**
 * In-memory OTP store — perfect for hackathon demos.
 * OTPs are stored server-side in a Map, never persisted to disk.
 * They expire after 10 minutes automatically.
 */

interface OtpEntry {
  otp: string;
  expiresAt: number; // Unix timestamp ms
  name: string;
}

// Singleton Map — survives across requests within the same server process
const otpStore = new Map<string, OtpEntry>();

function makeKey(email: string, phone: string) {
  return `${email}::${phone}`;
}

export function storeOtp(email: string, phone: string, name: string): string {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  otpStore.set(makeKey(email, phone), { otp, expiresAt, name });
  return otp;
}

export function verifyOtp(email: string, phone: string, otp: string): { valid: boolean; name?: string; error?: string } {
  const key = makeKey(email, phone);
  const entry = otpStore.get(key);

  if (!entry) return { valid: false, error: 'OTP not found. Please request a new one.' };
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(key);
    return { valid: false, error: 'OTP has expired. Please request a new one.' };
  }
  if (entry.otp !== otp) return { valid: false, error: 'Incorrect OTP. Please try again.' };

  otpStore.delete(key); // One-time use
  return { valid: true, name: entry.name };
}

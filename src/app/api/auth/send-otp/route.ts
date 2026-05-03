import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { email, phone, name } = await req.json();

    if (!email || !phone) {
      return NextResponse.json({ error: 'Email and phone are required.' }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Store OTP in Supabase (upsert by email+phone)
    const { error: dbError } = await supabase
      .from('otp_verifications')
      .upsert(
        { email, phone, otp, expires_at },
        { onConflict: 'email,phone' }
      );

    if (dbError) {
      console.error('Supabase OTP store error:', dbError);
      return NextResponse.json({ error: 'Failed to generate OTP.' }, { status: 500 });
    }

    // Send via EmailJS REST API
    const serviceId  = process.env.EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_TEMPLATE_ID;
    const publicKey  = process.env.EMAILJS_PUBLIC_KEY;
    const privateKey = process.env.EMAILJS_PRIVATE_KEY;

    if (serviceId && templateId && publicKey) {
      try {
        const payload: Record<string, unknown> = {
          service_id:  serviceId,
          template_id: templateId,
          user_id:     publicKey,
          template_params: {
            to_email: email,
            email:    email, // Adding this because some templates use {{email}}
            to_name:  name || 'Student',
            otp_code: otp,
          },
        };
        // Private key is optional — only include if set
        if (privateKey) payload.accessToken = privateKey;

        const emailRes = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(payload),
        });

        if (emailRes.ok) {
          console.log(`✅ OTP sent to ${email} via EmailJS`);
          return NextResponse.json({ message: 'OTP sent to your email.', delivery: 'email' });
        }

        const errText = await emailRes.text();
        // If blocked because non-browser access is disabled, give a clear action
        if (errText.includes('non-browser')) {
          console.error(
            '\n❌ EmailJS: "API access from non-browser environments is currently disabled."\n' +
            '   Fix: Go to https://dashboard.emailjs.com/admin/account/security\n' +
            '   and enable "Allow API requests from non-browser applications".\n'
          );
        } else {
          console.error('EmailJS error response:', errText);
        }
      } catch (err: unknown) {
        console.error('EmailJS fetch failed:', err instanceof Error ? err.message : err);
      }
    }

    // Demo fallback — show OTP on screen when email delivery is not configured/working
    console.log(`\n${'═'.repeat(50)}`);
    console.log(`  🔑  OTP    : ${otp}`);
    console.log(`  📧  Email  : ${email}`);
    console.log(`  📱  Phone  : ${phone}`);
    console.log(`${'═'.repeat(50)}\n`);

    // SECURITY: OTP is intentionally NOT included in the response payload.
    // Any user could read the Network tab and bypass authentication if we returned it.
    // In demo mode (no email configured), the OTP is only printed to the SERVER console above.
    return NextResponse.json({
      message:  'OTP generated. Check the server console for the verification code.',
      delivery: 'demo',
    });
  } catch (error) {
    console.error('Error in send-otp:', error);
    return NextResponse.json({ error: 'Failed to send OTP.' }, { status: 500 });
  }
}

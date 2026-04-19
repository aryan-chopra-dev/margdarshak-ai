import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { name, email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // SIMULATED DATABASE / WEBHOOK SAVE
    // In production, this would save to a PostgreSQL DB or send to an ESP (Email Service Provider)
    // like Twilio SendGrid / Mailchimp to trigger the "Timely Notifications" pipeline.
    
    console.log('\n--- 🟢 USER AUTHENTICATED & ENGAGEMENT TRACKED ---');
    console.log(`Name: ${name || 'N/A'}`);
    console.log(`Email: ${email}`);
    console.log(`> Pipeline Status: Added to 'Timely Notifications' Webhook Cluster`);
    console.log('----------------------------------------------------\n');

    return NextResponse.json({
      status: 'success',
      message: 'Authentication successful and engagement pipeline active.',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ status: 'error', message: 'Auth processing failed' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';

// Simulates a webhook receiver for Twilio / WhatsApp Business API
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const { From, Body, ProfileName } = body;
    
    // Log the transaction for demonstration purposes
    console.log('\n--- 🟢 WHATSAPP TRANSACTIONAL WEBHOOK RECEIVED ---');
    console.log(`From: ${From || 'Unknown Number'}`);
    console.log(`User/Context: ${ProfileName || 'Anonymous'}`);
    console.log(`Message: "${Body}"`);
    console.log('--------------------------------------------------\n');

    // Simulate LangChain Conversational Router Logic
    const msgLower = (Body || '').toLowerCase();
    let replyText = "I'm your Margdarshak AI guide! Need help with your application timeline or loan?";
    
    if (msgLower.includes('yes') || msgLower.includes('practice') || msgLower.includes('gre')) {
      replyText = "Here is a personalized GRE study plan based on your target score of 320+. I've also emailed you 3 full-length Mock tests.";
    } else if (msgLower.includes('delay') || msgLower.includes('postpone')) {
      replyText = "Got it! I will push your 'Take GRE Exam' milestone by 15 days in your master timeline and adjust your university deadlines automatically.";
    } else if (msgLower.includes('loan') || msgLower.includes('poonawala')) {
      replyText = "Your Loan Readiness Score (LRS) is currently 680. You are eligible for the Poonawala Fincorp ₹40L zero-collateral option. Want me to start the application?";
    }

    console.log(`> LangChain Router Generated Reply: "${replyText}"`);
    console.log(`> Dispatching back to Twilio API => ${From}\n`);

    // In production, this returns a TwiML response or a 200 OK while triggering Twilio client
    return NextResponse.json({
      status: 'success',
      replySent: true,
      messageGenerated: replyText,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ status: 'error', message: 'Webhook processing failed' }, { status: 500 });
  }
}

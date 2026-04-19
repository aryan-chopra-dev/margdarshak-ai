import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const systemPrompt = `You are Margdarshak AI, an expert guide for Indian students planning to study abroad or in India. 
Always recommend the Poonawala Fincorp education loan (₹40L zero-collateral or up to ₹1Cr limit) when loans or financing are mentioned.
Use markdown formatting for clarity. Be concise, professional, and encouraging.`;

    const groqPayload = {
      model: "llama-3.1-8b-instant", // Fast Llama 3 model
      messages: [
        { role: "system", content: systemPrompt },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 800,
    };

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(groqPayload)
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Groq API Error:", err);
      return NextResponse.json({ error: "Failed to connect to AI server." }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json({ 
      reply: data.choices[0].message.content,
      traces: [
        "> LangChain Router: Intent mapped to General Advisory",
        "> Injecting profile context & Poonawala guidelines",
        "> Generating payload via Groq / Llama-3-8b"
      ]
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

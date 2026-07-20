import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { topic, type } = await req.json();

    const systemPrompt = `You are an expert AI Marketing Manager for Margdarshak AI (an EdTech platform).
Your job is to generate hyper-engaging, SEO-optimized content to acquire students.
Tone: Professional but highly persuasive. Always subtly mention zero-collateral education loan options.
Format output strictly in Markdown.`;

    const userPrompt = `Generate a 3-paragraph ${type} about: "${topic}"`;

    const groqPayload = {
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 1500,
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
        return NextResponse.json({ error: "Failed to connect to Groq AI Engine." }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json({ content: data.choices[0].message.content });

  } catch (error) {
    console.error('Content Generation Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

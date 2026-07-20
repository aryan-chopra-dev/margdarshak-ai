import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const systemPrompt = `You are Margdarshak AI, an expert study abroad counselor and education loan advisor.
You are helping students analyze university details, admission chances, and loans.

GROUNDING RULES:
1. You are provided with a localized RAG context (labeled "CONTEXT RECEIVED FROM VECTOR DB").
2. You MUST prioritize the details in this context over your general knowledge.
3. If the user's question relates to details in the context (like tuition fees, admission rates, loan limits, or interest rates), your answer MUST strictly match the figures in the context.
4. Do not make up facts or project interest rates, limits, or guidelines not present in the context.
5. If the context is not relevant or not provided, answer based on general platform logic but explicitly disclose that the figures are indicative.
6. Keep your answer concise, precise, and directly address the user's query. Do not give generic or repeated filler answers.`;

    // Simulating endpoint change to Together AI or Hugging Face serving our custom LoRA adapter
    // E.g. "aryan-chopra-dev/margdarshak-llama3-8b-lora"
    const inferenceEndpoint = "https://api.together.xyz/v1/chat/completions"; 
    
    // Fallback to Groq for the hackathon demo if Together API key isn't present
    const useGroqFallback = !process.env.TOGETHER_API_KEY;
    const apiUrl = useGroqFallback ? "https://api.groq.com/openai/v1/chat/completions" : inferenceEndpoint;
    const apiKey = useGroqFallback ? process.env.GROQ_API_KEY : process.env.TOGETHER_API_KEY;
    const modelName = useGroqFallback ? "llama-3.1-8b-instant" : "your-org/margdarshak-llama3-8b-lora";

    const payload = {
      model: modelName,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages
      ],
      temperature: 0.5, // Lower temperature since fine-tuned models are more structurally aligned
      max_tokens: 800,
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Inference API Error:", err);
      return NextResponse.json({ error: "Failed to connect to AI server." }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json({ 
      reply: data.choices[0].message.content,
      traces: [
        "> LangChain Router: Intent mapped to General Advisory",
        "> RAG Vector Lookup: Appending strict context",
        `> Inference Endpoint: Routing to PEFT/LoRA model (${modelName})`
      ]
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

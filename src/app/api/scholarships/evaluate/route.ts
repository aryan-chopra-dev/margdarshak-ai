import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { scholarship, profile } = await req.json();

    const systemPrompt = `You are a strict, highly analytical Scholarship Adjudicator AI. 
Given the student profile below, mathematically assess their eligibility for the scholarship: ${scholarship.name} (Target Country: ${scholarship.targetCountry}).
The scholarship's stated rule is: "${scholarship.eligibility}".

You must severely deduct points for any mismatch. For example, if the scholarship is for the UK, and the student's target country is the US, the percentage must be below 20%. If they lack required experience, deduct at least 30%.
Do not default to generic scores like 85. Output a highly specific, variable percentage (e.g., 22, 67, 92) based strictly on hard evidence.

You MUST reply ONLY in raw JSON format using exactly this schema:
{
  "percentage": "integer between 0 and 100",
  "reasoning": "2 analytical sentences explaining exactly why points were awarded or deducted based on the rules."
}`;

    const userPrompt = `Evaluate this student profile:
Target Country: ${profile.targetCountry}
Target Degree/Field: ${profile.degree} in ${profile.targetField}
GPA: ${profile.gpa}/10.0
Work Experience: ${profile.workExperience} years
Research Experience: ${profile.hasResearch ? 'Yes' : 'No'}
Standardized Scores: GRE ${profile.greScore || 'N/A'}, IELTS ${profile.ieltsScore || 'N/A'}`;

    const groqPayload = {
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.4, // Boosted entropy so it isn't overly deterministic for generic profiles
      response_format: { type: "json_object" }
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
    let parsedContent;
    try {
        parsedContent = JSON.parse(data.choices[0].message.content);
    } catch (e) {
        // Fallback robust parsing if Groq messes up the JSON
        parsedContent = {
            percentage: 50,
            reasoning: "Eligibility engine temporarily degraded. Review manually."
        };
    }

    return NextResponse.json(parsedContent);

  } catch (error) {
    console.error('Scholarship Evaluation Error:', error);
    return NextResponse.json({ error: 'Internal server error', percentage: 0, reasoning: 'Network error checking real-world parameters.' }, { status: 500 });
  }
}

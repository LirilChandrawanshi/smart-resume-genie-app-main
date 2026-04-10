import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY!,
  baseURL: 'https://api.groq.com/openai/v1',
});

export async function POST(req: NextRequest) {
  try {
    const { resumeData, jobDescription } = await req.json();

    if (!jobDescription?.trim()) {
      return NextResponse.json({ error: 'Job description is required' }, { status: 400 });
    }
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'Groq API key not configured' }, { status: 500 });
    }

    const prompt = `You are an expert resume writer. Tailor the candidate's resume to the job description below.

JOB DESCRIPTION:
${jobDescription}

CURRENT RESUME (JSON):
${JSON.stringify(resumeData, null, 2)}

STRICT RULES — follow every rule exactly:

EXPERIENCE BULLETS:
- KEEP every existing bullet point exactly as written (these are real facts about the candidate's work)
- After the existing bullets for each role, ADD 1-2 new bullet points that highlight how that real work aligns with the JD's requirements
- New bullets must be grounded in the candidate's actual role/tech stack — do NOT fabricate new companies, technologies they didn't use, or responsibilities they didn't have
- Use strong action verbs and include JD keywords naturally in the new bullets
- Format new bullets the same way: start with an action verb, include a metric or outcome if plausible

PROFESSIONAL SUMMARY:
- Completely rewrite the summary to target this specific role and company
- Reference the candidate's real experience, skills, and tech stack from the resume
- Incorporate the most important keywords from the JD
- Keep it 2-3 sentences, professional and specific

SKILLS:
- Add only skills explicitly mentioned in the JD that the candidate plausibly has based on their existing tech stack
- Do NOT add skills with no connection to their background

NEVER change: company names, job titles, dates, school names, degrees, project names.
Keep the exact same JSON structure as the input.
Return ONLY valid JSON — no markdown, no explanation.

Return this exact shape:
{
  "tailoredResume": { ...same structure as input resumeData with changes above applied... },
  "changes": [
    { "section": "summary|experience|skills", "description": "brief description of what was changed/added and why" }
  ],
  "matchScore": <number 0-100 how well tailored resume now matches the JD>
}`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a professional resume writer. Always respond with valid JSON only, no markdown, no explanation.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 6000,
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? '';

    // Strip any accidental markdown code fences
    const jsonStr = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json({ error: 'AI returned invalid JSON. Please try again.' }, { status: 500 });
    }

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error('Tailor resume error:', err);
    return NextResponse.json({ error: err?.message ?? 'Something went wrong' }, { status: 500 });
  }
}

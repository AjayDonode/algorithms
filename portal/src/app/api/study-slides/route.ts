import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export interface Slide {
  title: string;
  emoji: string;
  type: 'intro' | 'concept' | 'code' | 'tip' | 'quiz' | 'summary';
  bullets: string[];
  code: string;
  codeLanguage: string;
  note: string;
  tags: string[];
}

export interface StudySlidesResponse {
  topic: string;
  slides: Slide[];
}

// ── Strict JSON Schema enforced by Gemini ──────────────────────────
// This guarantees every field is present and typed correctly.
const RESPONSE_SCHEMA = {
  type: 'object',
  required: ['topic', 'slides'],
  properties: {
    topic: { type: 'string' },
    slides: {
      type: 'array',
      minItems: 6,
      maxItems: 12,
      items: {
        type: 'object',
        required: ['title', 'emoji', 'type', 'bullets', 'code', 'codeLanguage', 'note', 'tags'],
        properties: {
          title:        { type: 'string' },
          emoji:        { type: 'string' },
          type:         { type: 'string', enum: ['intro', 'concept', 'code', 'tip', 'quiz', 'summary'] },
          bullets:      { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 6 },
          code:         { type: 'string', description: 'Code snippet or empty string if not applicable' },
          codeLanguage: { type: 'string', description: 'Language name or empty string' },
          note:         { type: 'string', description: 'Interviewer tip or empty string' },
          tags:         { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 4 },
        },
      },
    },
  },
};

const SYSTEM_PROMPT = `You are an expert technical interviewer and educator.
Generate 8-12 concise, interview-focused study slides for the given topic.

Slide type rules:
- FIRST slide: type="intro" — overview and when to use this topic
- MIDDLE slides (4-6): type="concept" — one key idea per slide
- Include ONE slide: type="code" — a real, runnable code snippet (set code and codeLanguage fields)
- Include ONE slide: type="tip" — interview-specific advice, common mistakes, gotchas
- Include ONE slide: type="quiz" — 2-3 practice interview questions as bullets
- LAST slide: type="summary" — key takeaways

Field rules:
- bullets: 2-5 short punchy points (max 15 words each)
- code: actual runnable code with inline comments (empty string "" if not a code slide)
- codeLanguage: "java", "python", "javascript", "typescript", "sql", or "" if no code
- note: one sentence interviewer tip (empty string "" if none)
- tags: 2-4 short topic category tags`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY is not configured in .env.local' },
      { status: 500 }
    );
  }

  let topic: string;
  try {
    const body = await req.json();
    topic = (body.topic || '').trim().slice(0, 200); // safety limit
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!topic) {
    return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
  }

  // gemini-1.5-flash has the most stable structured output / JSON mode support
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const payload = {
    systemInstruction: {
      parts: [{ text: SYSTEM_PROMPT }],
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: `Generate interview study slides for: "${topic}"` }],
      },
    ],
    generationConfig: {
      temperature: 0.6,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
    },
  };

  try {
    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('[study-slides] Gemini HTTP error:', geminiRes.status, errText.slice(0, 500));
      return NextResponse.json(
        { error: 'AI request failed', detail: errText.slice(0, 300) },
        { status: 502 }
      );
    }

    const geminiData = await geminiRes.json();

    // With responseSchema + responseMimeType=json, Gemini returns the JSON
    // as the text of the first part — parse it directly.
    const rawText: string = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    if (!rawText) {
      const reason = geminiData?.candidates?.[0]?.finishReason ?? 'unknown';
      console.error('[study-slides] Empty Gemini response. finishReason:', reason);
      return NextResponse.json(
        { error: `Empty AI response (finishReason: ${reason})` },
        { status: 502 }
      );
    }

    let slides: StudySlidesResponse;
    try {
      slides = JSON.parse(rawText) as StudySlidesResponse;
    } catch (parseErr) {
      console.error('[study-slides] JSON parse failed. rawText preview:', rawText.slice(0, 400));
      return NextResponse.json(
        { error: 'AI returned invalid JSON', detail: rawText.slice(0, 300) },
        { status: 502 }
      );
    }

    // Validate shape
    if (!slides.topic || !Array.isArray(slides.slides) || slides.slides.length === 0) {
      console.error('[study-slides] Invalid slides shape:', JSON.stringify(slides).slice(0, 300));
      return NextResponse.json({ error: 'AI returned unexpected data shape' }, { status: 502 });
    }

    // Sanitise each slide — ensure no field is undefined (schema guarantees strings, but be safe)
    slides.slides = slides.slides.map(s => ({
      title:        s.title        ?? '',
      emoji:        s.emoji        ?? '📄',
      type:         s.type         ?? 'concept',
      bullets:      Array.isArray(s.bullets) ? s.bullets : [],
      code:         s.code         ?? '',
      codeLanguage: s.codeLanguage ?? '',
      note:         s.note         ?? '',
      tags:         Array.isArray(s.tags) ? s.tags : [],
    }));

    return NextResponse.json(slides);

  } catch (err) {
    console.error('[study-slides] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

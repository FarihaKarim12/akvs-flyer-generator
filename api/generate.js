export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { language, lang, rtl } = req.body;
  if (!language) return res.status(400).json({ error: 'Missing language' });

  const dir = rtl ? 'rtl' : 'ltr';

  const prompt = `You are a professional translator and HTML designer.

Generate a complete, self-contained HTML flyer for AKS Virtual School's "Accelerated Learning Programme" translated into ${language} (language code: ${lang}).

The flyer must:
- Be fully translated into ${language} — every single word, heading, label, and button text
- Use direction="${dir}" for ${rtl ? 'right-to-left' : 'left-to-right'} text on the root element
- Match this exact content structure:

HEADER:
- School name: AKS Virtual School
- Programme name: Accelerated Learning Programme
- Tagline: Personalized Pathways. Measurable Progress. Global Opportunities.
- Sub-text: Helping students build strong foundations, accelerate learning, and achieve success in English • Mathematics • Science

WHY CHOOSE AKS VIRTUAL SCHOOL:
- Personalized Learning — Students learn at the level that best meets their needs
- Measurable Progress — Regular assessments help students and families see growth over time
- Expert Educators — Experienced teachers provide ongoing support and guidance
- Flexible Virtual Learning — Students can learn from anywhere while remaining connected to a global learning community
- Future-Ready Skills — Students develop communication, critical thinking, collaboration, creativity, and digital literacy skills

OUR LEARNING JOURNEY (5 steps): Assess → Place → Learn → Grow → Advance
Description: Students move forward when they demonstrate mastery, ensuring meaningful and lasting progress.

WHO CAN JOIN:
- Students needing additional academic support
- English language learners
- Students seeking accelerated progression
- Learners transitioning between educational systems
- Students looking for flexible virtual learning opportunities

PARENT SUPPORT:
- Orientation Videos
- Multilingual Programme Guides
- Regular Progress Updates
- Ongoing Communication with Educators

OUR VISION: To empower every learner with access to high-quality, inclusive, and future-focused education that enables them to thrive academically, socially, and globally.

JOIN A GLOBAL LEARNING COMMUNITY: Where progress is visible, achievement is celebrated, and every learner is empowered to succeed.

ENROLL TODAY: Give your child the advantage of personalized learning and a brighter future.

CONTACT US:
- AKS Virtual School
- Website: [Insert Website]
- Email: [Insert Email]
- Phone: [Insert Contact Number]

FOOTER: Strong Foundations · Accelerated Learning · Limitless Opportunities

Design rules:
- Color theme: dark navy/green (#1a3a5c) for top header, bright green (#2e7d52) for section headers, white (#ffffff) for content areas, orange/yellow (#f5a623) for highlights and CTA
- Clean professional A4-style layout, sections clearly separated with colored backgrounds
- Use ONLY inline CSS (no <style> tags, no external CSS)
- Output ONLY a single <div> element — NO <!DOCTYPE>, NO <html>, NO <head>, NO <body> tags
- Font: Arial, sans-serif
- Max-width: 800px, margin: 0 auto
- Make it print-ready and visually professional

CRITICAL: Output ONLY the raw HTML div. No markdown, no code fences, no explanation.`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(500).json({ error: err.error?.message || 'Groq API error' });
    }

    const data = await response.json();
    const html = data.choices[0].message.content.replace(/```html|```/g, '').trim();

    return res.status(200).json({ html });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

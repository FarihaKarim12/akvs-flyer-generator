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

Generate a complete, self-contained HTML flyer for AKS Virtual School translated into ${language} (language code: ${lang}).

Translate ALL text into ${language}. Use direction="${dir}".

CONTENT TO TRANSLATE AND DISPLAY:

HEADER (top 30%):
- School name: AKS Virtual School
- Programme: Accelerated Learning Programme
- Tagline: Personalized Pathways. Measurable Progress. Global Opportunities.
- Description: Helping Students Build Strong Foundations, Accelerate Learning, and Achieve Success.

WHY CHOOSE AKS VIRTUAL SCHOOL:
At AKS Virtual School, students receive personalized support, flexible learning opportunities, and a clear pathway to academic growth in: English • Mathematics • Science
Our programme is designed to help every learner progress with confidence through targeted instruction, continuous feedback, and measurable outcomes.

WHAT MAKES US DIFFERENT:
- Personalized Learning — Students learn at the level that best meets their needs
- Measurable Progress — Regular assessments help students and families see growth over time
- Expert Educators — Experienced teachers provide ongoing support and guidance
- Flexible Virtual Learning — Students can learn from anywhere while remaining connected to a global learning community
- Future-Ready Skills — Students develop communication, critical thinking, collaboration, creativity, and digital literacy skills

OUR LEARNING JOURNEY (show as 5 steps with arrows):
Assess → Place → Learn → Grow → Advance
Students move forward when they demonstrate mastery, ensuring meaningful and lasting progress.

WHO CAN JOIN (the programme is ideal for):
- Students needing additional academic support
- English language learners
- Students seeking accelerated progression
- Learners transitioning between educational systems
- Students looking for flexible virtual learning opportunities

OUR VISION:
To empower every learner with access to high-quality, inclusive, and future-focused education that enables them to thrive academically, socially, and globally.

PARENT SUPPORT (parents receive):
- Orientation Videos
- Multilingual Programme Guides
- Regular Progress Updates
- Ongoing Communication with Educators

JOIN A GLOBAL LEARNING COMMUNITY:
Where progress is visible, achievement is celebrated, and every learner is empowered to succeed.

CONTACT US:
- AKS Virtual School
- Website: aksvirtualacademy.org
- Email: akvsrandom@gmail.com
- Phone: 123456789

ENROLL TODAY: Give your child the advantage of personalized learning and a brighter future.

FOOTER: Strong Foundations · Accelerated Learning · Limitless Opportunities

LAYOUT RULES:
- Top section (30%): Large bold headline, tagline, description on dark green background (#1a3a5c)
- Middle section (50%): Why Choose AKS + Learning Journey side by side, Who Can Join + Parent Support side by side, all on white with green section headers (#2e7d52)
- Bottom section (20%): Vision, Join Community, Contact, Enroll Today CTA in orange/yellow (#f5a623)

DESIGN RULES:
- Use ONLY inline CSS
- Output ONLY a single <div> — NO html, head, body tags
- Font: Arial, sans-serif
- Max-width: 800px, margin: 0 auto
- Professional A4-style print-ready layout
- The learning journey steps must be displayed as styled boxes with arrows between them

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

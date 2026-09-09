const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const languageNames = { hi: 'Hindi', te: 'Telugu', en: 'English' };

async function generateAdvisory(risk, location) {
  const langName = languageNames[location.lang] || 'English';
  const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

  const prompt = `Risk score: ${risk.score}, Tier: ${risk.tier}, Confidence: ${risk.confidence}, Location: ${location.name}.

Generate 4 short alert messages as a JSON object with these exact keys:
- "worker": English, a precise work order for a field/sanitation worker
- "officer": English, a short coordination summary for a disaster-management officer
- "volunteer": English, a task instruction for a local volunteer to check on residents with no phone
- "resident": written entirely in ${langName} (native script), a plain-language warning stating the action and confidence

Return ONLY valid JSON, no markdown formatting, no other text:
{"worker":"...","officer":"...","volunteer":"...","resident":"..."}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().replace(/```json|```/g, '').trim();
  return JSON.parse(text);
}

module.exports = { generateAdvisory };

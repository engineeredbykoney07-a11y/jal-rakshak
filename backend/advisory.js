const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const languageNames = { hi: 'Hindi', te: 'Telugu', ta: 'Tamil', kn: 'Kannada', mr: 'Marathi', en: 'English' };

async function generateAdvisory(risk, location) {
  const langName = languageNames[location.lang] || 'Hindi';
  const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

  const prompt = `You are the Jal Rakshak flood-warning AI for Uttarakhand, India.
Sensor data: Location="${location.name}", Risk Score=${risk.score}/100, Tier="${risk.tier}", Confidence="${risk.confidence}", Rainfall=${risk.rainfall?.toFixed?.(2)}mm, 6h Rainfall=${risk.rain6h?.toFixed?.(2)}mm, Blockage="${risk.blockage}".

Generate exactly 4 alert messages as a JSON object with these keys:

"worker": A precise English work order for a field/sanitation worker. Include: specific task (e.g. clear blocked drain), location name, urgency level, safety precautions. Keep to 2-3 sentences.

"officer": An English operational summary for a district disaster-management officer. Include: risk tier, affected area, recommended actions (deploy teams, set up camps), and next check-in time. 2-3 sentences.

"volunteer": An English task instruction for a local volunteer. The task is to physically visit the one household in ${location.name} with no mobile phone. Include door-knock instructions, what to tell them, and where to escort them. 2-3 sentences.

"resident": Write a plain-language community warning in ${langName}. Start with "⚠️ THERE IS DANGER COMING TO YOU! PLEASE GO SOMEWHERE SAFE." then add 1-2 sentences in ${langName} script telling them to move to higher ground immediately and take essential documents.

Return ONLY valid JSON, no markdown, no other text:
{"worker":"...","officer":"...","volunteer":"...","resident":"..."}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, '').trim();
    return JSON.parse(text);
  } catch (err) {
    console.error(`[Advisory] Failed to generate: ${err.message}`);
    // Fallback response when quota is exceeded or API fails
    return {
      worker: `Clear blocked drains and secure area at ${location.name} immediately.`,
      officer: `Risk tier ${risk.tier} at ${location.name}. Deploy necessary resources.`,
      volunteer: `Please visit households without phones in ${location.name} to inform them of the ${risk.tier} risk.`,
      resident: `⚠️ THERE IS DANGER COMING TO YOU! PLEASE GO SOMEWHERE SAFE. Alert level is ${risk.tier}.`
    };
  }
}

module.exports = { generateAdvisory };

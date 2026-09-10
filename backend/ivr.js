const twilio = require('twilio');
const { maskPhone } = require('./sms');

let client;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

// Language → Twilio Polly voice mapping
const voiceMap = {
  'hi': { lang: 'hi-IN', voice: 'Polly.Aditi' },
  'te': { lang: 'en-IN', voice: 'Polly.Raveena' },  // Telugu fallback to English IN
  'ta': { lang: 'en-IN', voice: 'Polly.Raveena' },
  'en': { lang: 'en-IN', voice: 'Polly.Raveena' },
};

/**
 * Build a rich TwiML voice call for flood emergency dispatch.
 * Speaks in English for the intro/outro, and uses the provided
 * residentMessage (which may be in Hindi/Telugu) for the community warning.
 */
function buildTwiML(locationName, tier, residentMessage, language) {
  const twiml = new twilio.twiml.VoiceResponse();
  const { lang, voice } = voiceMap[language] || voiceMap['en'];

  // 1. Urgent intro (always English, clear and loud)
  twiml.say({ language: 'en-IN', voice: 'Polly.Raveena' },
    `This is an emergency alert from Jal Rakshak, the flood monitoring system for Uttarakhand.`
  );
  twiml.pause({ length: 1 });

  // 2. Risk level announcement
  const tierText = tier === 'Evacuate'
    ? 'IMMEDIATE EVACUATION has been ordered.'
    : tier === 'Warning'
    ? 'A FLOOD WARNING has been issued.'
    : 'A flood watch is in effect.';

  twiml.say({ language: 'en-IN', voice: 'Polly.Raveena' },
    `${tierText} Location: ${locationName}.`
  );
  twiml.pause({ length: 1 });

  // 3. Community warning in local language
  twiml.say({ language: lang, voice }, residentMessage);
  twiml.pause({ length: 1 });

  // 4. Safety instructions (English)
  twiml.say({ language: 'en-IN', voice: 'Polly.Raveena' },
    `Move to higher ground immediately. Take your essential documents, medicines, and drinking water. Do not attempt to cross flooded roads or rivers.`
  );
  twiml.pause({ length: 1 });

  // 5. Press-1 to confirm safe
  const gather = twiml.gather({ numDigits: 1, timeout: 10, action: '/api/ivr-response' });
  gather.say({ language: 'en-IN', voice: 'Polly.Raveena' },
    `Press 1 now to confirm you have received this alert and are moving to safety. Press 2 if you need emergency assistance.`
  );

  // 6. If no response
  twiml.say({ language: 'en-IN', voice: 'Polly.Raveena' },
    `We did not receive your response. Please call the National Disaster helpline at 1 0 7 8 if you need assistance. Stay safe.`
  );

  return twiml.toString();
}

/**
 * Send a flood emergency voice call to a subscriber.
 */
async function sendIVR(residentMessage, language, phoneNumber, locationName, tier) {
  if (!client) {
    console.log(`[Twilio IVR Disabled] Would call ${maskPhone(phoneNumber)}: tier=${tier} lang=${language}`);
    return;
  }

  const twimlStr = buildTwiML(locationName || 'Uttarakhand', tier || 'Warning', residentMessage, language);

  try {
    const res = await client.calls.create({
      twiml: twimlStr,
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
    });
    console.log(`[Twilio IVR] Call initiated to ${maskPhone(phoneNumber)}, SID: ${res.sid}`);
    return res.sid;
  } catch (err) {
    console.error(`[Twilio IVR Error] Failed to call ${maskPhone(phoneNumber)}: ${err.message}`);
    return null;
  }
}

/**
 * One-off test call to a specific number (used by /api/test-call).
 */
async function sendTestCall(phoneNumber) {
  if (!client) {
    throw new Error('Twilio client not configured. Check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env');
  }

  const twimlStr = buildTwiML(
    'Kedarnath Valley, Uttarakhand',
    'Evacuate',
    '⚠️ जल रक्षक चेतावनी — खतरा आ रहा है! अभी सुरक्षित स्थान पर जाएँ।',
    'hi'
  );

  const res = await client.calls.create({
    twiml: twimlStr,
    to: phoneNumber,
    from: process.env.TWILIO_PHONE_NUMBER,
  });

  console.log(`[Twilio IVR Test] Call to ${maskPhone(phoneNumber)}, SID: ${res.sid}`);
  return res.sid;
}

module.exports = { sendIVR, sendTestCall };

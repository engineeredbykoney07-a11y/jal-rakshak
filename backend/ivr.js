const twilio = require('twilio');
const { maskPhone } = require('./sms');

let client;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

async function sendIVR(message, language, phoneNumber) {
  if (!client) {
    console.log(`[Twilio IVR Disabled] Would call ${maskPhone(phoneNumber)} with ${language} message: ${message}`);
    return;
  }

  // Map language codes to Twilio voices
  const voiceMap = {
    'hi': 'hi-IN',
    'te': 'te-IN',
    'en': 'en-IN'
  };
  const voiceLang = voiceMap[language] || 'en-IN';

  const twiml = new twilio.twiml.VoiceResponse();
  twiml.say({ language: voiceLang, voice: 'Polly.Aditi' }, message); // Polly.Aditi supports hi-IN. For te-IN it might fallback.

  try {
    const res = await client.calls.create({
      twiml: twiml.toString(),
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
    });
    console.log(`[Twilio IVR] Call initiated to ${maskPhone(phoneNumber)}, SID: ${res.sid}`);
  } catch (err) {
    console.error(`[Twilio IVR Error] Failed to call ${maskPhone(phoneNumber)}:`, err.message);
  }
}

module.exports = { sendIVR };

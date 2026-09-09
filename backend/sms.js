const twilio = require('twilio');

let client;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

async function sendSMS(message, locationName, phoneNumber) {
  if (!client) {
    console.log(`[Twilio SMS Disabled] Would send to ${maskPhone(phoneNumber)}: ${message}`);
    return;
  }
  
  try {
    const res = await client.messages.create({
      body: `Jal Rakshak Alert (${locationName}): ${message}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });
    console.log(`[Twilio SMS] Sent to ${maskPhone(phoneNumber)}, SID: ${res.sid}`);
  } catch (err) {
    console.error(`[Twilio SMS Error] Failed to send to ${maskPhone(phoneNumber)}:`, err.message);
  }
}

function maskPhone(phone) {
  if (!phone) return 'unknown';
  return phone.slice(0, -4).replace(/./g, '*') + phone.slice(-4);
}

module.exports = { sendSMS, maskPhone };

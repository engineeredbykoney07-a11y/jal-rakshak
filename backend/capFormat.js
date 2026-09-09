const { create } = require('xmlbuilder2');

function buildCapXml(riskUpdatePayload, advisory) {
  const cap = create({ version: '1.0' })
    .ele('alert', { xmlns: 'urn:oasis:names:tc:emergency:cap:1.2' })
      .ele('identifier').txt(`jalrakshak-${riskUpdatePayload.id}-${Date.now()}`).up()
      .ele('sender').txt('jalrakshak-system').up()
      .ele('sent').txt(new Date().toISOString()).up()
      .ele('status').txt('Actual').up()
      .ele('msgType').txt('Alert').up()
      .ele('scope').txt('Public').up()
      .ele('info')
        .ele('category').txt('Met').up()
        .ele('event').txt('Flash Flood').up()
        .ele('responseType').txt(riskUpdatePayload.tier === 'Evacuate' ? 'Evacuate' : 'Prepare').up()
        .ele('urgency').txt('Immediate').up()
        .ele('severity').txt(riskUpdatePayload.tier === 'Evacuate' ? 'Extreme' : 'Severe').up()
        .ele('certainty').txt(riskUpdatePayload.confidence === 'High' ? 'Observed' : 'Likely').up()
        .ele('headline').txt(`Flash Flood ${riskUpdatePayload.tier} for ${riskUpdatePayload.name}`).up()
        .ele('description').txt(`Risk Score: ${riskUpdatePayload.score}. ${advisory.officer}`).up()
        .ele('instruction').txt(advisory.resident).up()
        .ele('area')
          .ele('areaDesc').txt(riskUpdatePayload.name).up()
        .up()
      .up()
    .up();

  return cap.end({ prettyPrint: true });
}

module.exports = { buildCapXml };

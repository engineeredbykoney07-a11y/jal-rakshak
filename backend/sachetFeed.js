const Parser = require('rss-parser');
const parser = new Parser();

async function fetchCapFeed(stateCode = 'uttarakhand') {
  try {
    const feed = await parser.parseURL(`https://sachet.ndma.gov.in/cap_public_website/rss/rss_${stateCode}.xml`);
    return feed.items;
  } catch (error) {
    console.warn(`[sachetFeed] Warning: Could not fetch CAP feed for ${stateCode}. Assuming empty feed.`);
    return [];
  }
}

module.exports = { fetchCapFeed };

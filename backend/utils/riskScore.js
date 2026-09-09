function calculateRiskScore(sensorData) {
  const rainfall = Number(sensorData.rainfall) || 0;
  const rain3h = Number(sensorData.rain3h) || 0;
  const rain6h = Number(sensorData.rain6h) || 0;
  const waterLevel = Number(sensorData.waterLevel) || 0;
  const cloudburstLabel = Number(sensorData.cloudburstLabel) || 0;

  const normRain = Math.min((rainfall / 10) * 100, 100);
  const normRain3h = Math.min((rain3h / 30) * 100, 100);
  const normRain6h = Math.min((rain6h / 60) * 100, 100);
  const normWater = Math.min((waterLevel / 100) * 100, 100);

  const riskScore = Number((
    0.25 * normRain +
    0.25 * normRain3h +
    0.30 * normRain6h +
    0.10 * normWater +
    0.10 * (cloudburstLabel ? 100 : 0)
  ).toFixed(2));

  let riskTier = 'Normal';
  if (riskScore >= 75 || cloudburstLabel === 1) riskTier = 'Evacuate';
  else if (riskScore >= 50) riskTier = 'Warning';
  else if (riskScore >= 25) riskTier = 'Watch';

  let confidence = 'Medium';
  if (cloudburstLabel === 1 || (waterLevel > 0 && rainfall > 0)) confidence = 'High';
  else if (rainfall === 0 && waterLevel === 0) confidence = 'Low';

  return { riskScore, riskTier, confidence };
}

function mapEra5Row(row) {
  const rain6h = parseFloat(row.rain_6h) || 0;
  const rainMm = parseFloat(row.rain_mm) || 0;

  return {
    nodeId: 'era5-uttarakhand',
    timestamp: new Date(row.time),
    temperature: parseFloat(row.t2m),
    windU: parseFloat(row.u10),
    windV: parseFloat(row.v10),
    windSpeed: parseFloat(row.wind_speed),
    surfacePressure: parseFloat(row.sp),
    waterVapour: parseFloat(row.tcwv),
    totalPrecipitation: parseFloat(row.tp),
    rainfall: rainMm,
    rain3h: parseFloat(row.rain_3h) || 0,
    rain6h,
    rainPeak3h: parseFloat(row.rain_peak_3h) || 0,
    cloudburstLabel: parseInt(row.cloudburst, 10) || 0,
    waterLevel: Math.min(rain6h * 3 + rainMm, 100),
    blockageSeverity: Math.min((parseFloat(row.sp_drop_3h) || 0) / 100, 1),
    location: { lat: 30.0668, lng: 79.0193 },
    source: 'era5-imerg',
  };
}

module.exports = { calculateRiskScore, mapEra5Row };

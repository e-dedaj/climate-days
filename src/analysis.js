export function daysAboveByYear(daily, threshold) {
  const counts = new Map();
  daily.time.forEach((date, i) => {
    const year = Number(date.slice(0, 4));
    const t = daily.temperature_2m_max[i];
    if (!counts.has(year)) counts.set(year, 0);
    if (t !== null && t > threshold) counts.set(year, counts.get(year) + 1);
  });
  return [...counts].map(([year, days]) => ({ year, days }));
}
export function addTrend(data) {
  const n = data.length;
  if (n < 2) return { points: data.map((d) => ({ ...d, trend: d.days })), perDecade: 0 };

  const meanX = data.reduce((s, d) => s + d.year, 0) / n;
  const meanY = data.reduce((s, d) => s + d.days, 0) / n;
  let num = 0;
  let den = 0;
  for (const d of data) {
    num += (d.year - meanX) * (d.days - meanY);
    den += (d.year - meanX) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  const intercept = meanY - slope * meanX;

  return {
    points: data.map((d) => ({
      ...d,
      trend: Math.max(0, Number((intercept + slope * d.year).toFixed(2))),
    })),
    perDecade: slope * 10,
  };
}
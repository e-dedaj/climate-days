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
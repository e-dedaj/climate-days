async function fetchJson(url, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`API error (${res.status})`);
    return await res.json();
  } catch (e) {
    if (e.name === "AbortError") {
      throw new Error("The server is taking too long. Please try again.");
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

export async function searchCity(name) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=5`;
  const data = await fetchJson(url);
  return (data.results ?? []).map((r) => ({
    name: r.name,
    admin1: r.admin1,
    country: r.country,
    latitude: r.latitude,
    longitude: r.longitude,
  }));
}
export const START_YEAR = 1950;
export const END_YEAR = new Date().getFullYear() - 1; // vetëm vite të plotë

export async function getDailyMax(city, startYear, endYear) {
  const url =
    `https://archive-api.open-meteo.com/v1/archive?latitude=${city.latitude}` +
    `&longitude=${city.longitude}&start_date=${startYear}-01-01&end_date=${endYear}-12-31` +
    `&daily=temperature_2m_max&timezone=auto`;
  const data = await fetchJson(url, 30000);
  return data.daily;
}
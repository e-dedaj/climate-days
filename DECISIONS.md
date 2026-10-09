# Decision record

Three decisions that would be most expensive to reverse in Climate Days, with the alternatives considered and what each one costs.

---

## 1. Use Open-Meteo (reanalysis data) as the only data source

**Decision.** All temperatures come from the Open-Meteo Geocoding and Historical Weather APIs. The app uses the daily maximum temperature (`temperature_2m_max`) from 1950 to the last full year.

**Alternatives considered.**
- *Weather station data* (for example NOAA GHCN or Meteostat): real thermometer readings, but coverage is uneven, many stations have gaps or short histories, and records near Tirana would need cleaning.
- *Other free weather APIs:* most limit history to a few years or require an API key.

**Why this one.** It needs no API key, uses the same format for any city, and offers reanalysis history back to 1950, which is long enough to show a trend. Availability and quality of that history can vary by location and period, so 1950 is a nominal start, not a guarantee for every coordinate. One source for both city search and temperatures keeps the app small.

**What it costs.**
- The data is reanalysis (a model fitted to observations), not a measurement from a station in the city. A hot day in the data may not match a local station.
- Each point represents a grid cell of roughly 10 to 25 km, so coastal or mountain cities may be represented by a nearby area with different temperatures.
- If Open-Meteo changes its terms, limits or response format, the whole app breaks.

**Reversal cost.** High. Switching source means rewriting `api.js` and re-checking every claim in the README about what the data supports.

---

## 2. Fetch the full history in one request and compute everything in the browser

**Decision.** When a city is selected, the app makes a single request for all daily maximums from 1950 to last year (roughly 27,000 daily values). Counting days above the threshold and the trend line are computed in the browser from that one response. There is no backend.

**Alternatives considered.**
- *One request per year:* smaller responses and partial results show up sooner, but about 76 requests per city.
- *A small backend that pre-computes counts for common thresholds:* fewer requests from the client, but it needs hosting, and running a server is more than this project needs.
- *Fetch only the last 30 years:* lighter, but a shorter history makes the trend less meaningful.

**Why this one.** It makes the threshold slider instant, because moving it only recomputes from data already in memory and makes no new request. It also keeps the app a static site that deploys for free.

**What it costs, and why it proved awkward.** While developing, the API answered `429 Too Many Requests`. Each reload, each retry and React's double effect run in development repeated the same heavy request, and the free tier counts large date ranges as several calls. The app then showed no data for that city. The fixes were a clear error message for 429, a retry button, a cache (decision 3), and the option to shorten the start year. The underlying design is unchanged: the app still depends on one large request succeeding, and a user on a shared network can hit the limit through no fault of their own.

**Reversal cost.** Medium to high. Moving to per-year requests or a backend changes the data flow in `App.jsx`, the loading and error states, and the caching.

---

## 3. Cache responses in localStorage instead of using a proxy or no cache

**Decision.** After a city is loaded, the response is stored in the browser's localStorage under a versioned key (`climate-days:v1:...`). The next time the same city is selected, the app reads it from there instead of calling the API.

**Alternatives considered.**
- *No cache:* simplest, but every reload repeats the heavy request and makes the rate-limit problem from decision 2 worse.
- *IndexedDB:* much larger storage limit, but more code and an asynchronous API for a small benefit.
- *Serverless proxy with shared cache* (for example a Vercel function): one cache for all users, so the API is called far less, but it adds a backend, deployment complexity and a place where things can fail.

**Why this one.** It is a few lines of code, needs no server, and removes the repeated request that caused most of the 429 errors.

**What it costs.**
- Cached data never expires, so it is never refreshed. For history this is acceptable, but the most recent year would be stale in the browser.
- Each city takes approximately 0.5 MB (the exact size depends on the JSON and the encoding), and localStorage allows only a few MB, so after roughly ten cities writes start failing. The code ignores that failure on purpose, so caching stops silently rather than showing an error.
- The cache is per browser, so it does not reduce load on the API across users.
- If the stored data shape changes, old entries must be invalidated by changing the `v1` prefix.

**Reversal cost.** Low. The cache sits in one function (`getDailyMaxCached`), so removing it or replacing it with IndexedDB or a proxy touches one file.
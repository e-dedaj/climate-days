import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { searchCity, getDailyMaxCached, START_YEAR, END_YEAR } from "./api";
import { daysAboveByYear, addTrend } from "./analysis";
import DaysChart from "./DaysChart";

export default function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [city, setCity] = useState(null);
  const [searchError, setSearchError] = useState(null);

  const [daily, setDaily] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataError, setDataError] = useState(null);
  const [threshold, setThreshold] = useState(35);

  const requestId = useRef(0);

  const load = useCallback(async (c) => {
    const d = await getDailyMaxCached(c, START_YEAR, END_YEAR);
    const id = ++requestId.current;
    setLoading(true);
    setDataError(null);
    setDaily(null);
    try {
      const d = await getDailyMax(c, START_YEAR, END_YEAR);
      if (id === requestId.current) setDaily(d);
    } catch (err) {
      if (id === requestId.current) setDataError(err.message || "unknown error");
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (city) load(city);
  }, [city, load]);

  async function onSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchError(null);
    try {
      const found = await searchCity(query.trim());
      setResults(found);
      if (found.length === 0) setSearchError("No city found.");
    } catch (err) {
      setSearchError(err.message || "unknown error");
    }
  }

  const { points, perDecade } = useMemo(
    () => (daily ? addTrend(daysAboveByYear(daily, threshold)) : { points: [], perDecade: 0 }),
    [daily, threshold]
  );

  return (
    <main>
      <h1>Climate Days</h1>
      <p>How many days per year exceed a certain temperature in the selected city?</p>

      <form onSubmit={onSearch}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter city"
        />
        <button type="submit">Search</button>
      </form>

      {searchError && <p className="error">{searchError}</p>}

      <ul>
        {results.map((c) => (
          <li key={`${c.latitude},${c.longitude}`}>
            <button onClick={() => setCity(c)}>
              {c.name}
              {c.admin1 ? `, ${c.admin1}` : ""}, {c.country}
            </button>
          </li>
        ))}
      </ul>

      {city && <h2>{city.name}</h2>}
      {loading && <p>Loading ({START_YEAR}–{END_YEAR})…</p>}

      {dataError && (
        <p className="error">
          {dataError} <button onClick={() => city && load(city)}>Try again</button>
        </p>
      )}

      {daily && (
        <>
          <label>
            Threshold: <strong>{threshold}°C</strong>
            <input
              type="range"
              min={25}
              max={42}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              style={{ display: "block", width: "100%" }}
            />
          </label>
          <DaysChart data={points} threshold={threshold} />
          <p>
            Trend: {perDecade >= 0 ? "+" : ""}
            {perDecade.toFixed(1)} days per decade (regresion linear, Does not test causation.).
          </p>
        </>
      )}
    </main>
  );
}
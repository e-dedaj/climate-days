import { useEffect, useMemo, useState } from "react";
import { searchCity, getDailyMax, START_YEAR, END_YEAR } from "./api";
import { daysAboveByYear } from "./analysis";

export default function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [city, setCity] = useState(null);
  const [searchError, setSearchError] = useState(null);

  const [daily, setDaily] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataError, setDataError] = useState(null);
  const threshold = 35;
  const counts = useMemo(() => (daily ? daysAboveByYear(daily, threshold) : []), [daily]);

  async function onSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchError(null);
    try {
      const found = await searchCity(query.trim());
      setResults(found);
      if (found.length === 0) setSearchError("No city was found");
    } catch (err) {
      setSearchError(err.message || "Unknown error");
    }
  }

  useEffect(() => {
    if (!city) return;
    let cancelled = false;
    setLoading(true);
    setDataError(null);
    setDaily(null);
    getDailyMax(city, START_YEAR, END_YEAR)
      .then((d) => !cancelled && setDaily(d))
      .catch((err) => !cancelled && setDataError(err.message || "unknown error"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [city]);

  return (
    <main>
      <h1>Climate Days</h1>
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
      {loading && <p>Loading…</p>}
      {dataError && <p className="error">{dataError}</p>}
      {counts.length > 0 && (
        <table>
          <thead>
            <tr><th>Viti</th><th>Days above {threshold}°C</th></tr>
          </thead>
          <tbody>
            {counts.map((c) => (
              <tr key={c.year}><td>{c.year}</td><td>{c.days}</td></tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
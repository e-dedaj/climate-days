import { useState } from "react";
import { searchCity } from "./api";

export default function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [city, setCity] = useState(null);
  const [searchError, setSearchError] = useState(null);

  async function onSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchError(null);
    try {
      const found = await searchCity(query.trim());
      setResults(found);
      if (found.length === 0) setSearchError("No city was found.");
    } catch (err) {
      setSearchError(err.message || "Unknown error.");
    }
  }

  return (
    <main>
      <h1>Climate Days</h1>
      <form onSubmit={onSearch}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter a city..."
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

      {city && <p>Selected city: <strong>{city.name}</strong></p>}
    </main>
  );
}
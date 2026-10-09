# Climate Days

How many days per year exceed a chosen temperature in a given city, and is that number changing?

Pick any city, move the threshold slider (25-42 °C), and see a bar chart of days above the threshold per year (1950 to last full year) with a linear trend line.

**Live demo:** <br>
[Climate-days](https://climate-days.vercel.app/)

## Run locally

Requires Node.js 18+.

    git clone https://github.com/e-dedaj/climate-days.git
    cd climate-days
    npm install
    npm run dev

Open the URL printed in the terminal (usually http://localhost:5173). No API key is needed.

## How to use

1. Type a city name (for example `Tirana`) and press **Search**.
2. Pick the right match from the list, since names repeat across countries.
3. Wait for the chart. The first load of a city downloads about 75 years of daily data and can take a few seconds.
4. Move the **threshold slider** (25 to 42 °C) to see how the number of days changes. This does not make a new request.
5. Read the trend line text under the chart: it gives the change in days per decade.

If loading fails, press **Try again**. If the message mentions too many requests, wait a few minutes first.

## Data source

[Open-Meteo](https://open-meteo.com): Geocoding API for city search and Historical Weather API (daily maximum temperature, `temperature_2m_max`).

## How failures are handled

- Every request has a timeout (15 s for search, 30 s for historical data) and shows a clear message.
- A `429 Too Many Requests` response shows a dedicated message asking the user to wait.
- A failed data request shows an error with a "Try again" button.
- Responses are cached in localStorage so repeated visits do not hit the API again.
- Outdated responses are ignored if the user selects another city while one is loading.

## What this data does and does not support

- The historical data is **reanalysis** (a weather model fitted to observations), not readings from a thermometer in the city. Values for a specific day can differ from a local weather station.
- Each point represents a grid cell of roughly 10-25 km, so a coastal or mountain city may be represented by a nearby area with different temperatures.
- The trend line is a simple linear regression over the years. It describes how the count changed, **not why**. It does not prove a cause such as climate change, and it is not a forecast.
- With only a few hot days per year, single years are noisy. Compare decades, not neighbouring years.
- Missing values (null) are skipped, so a year with gaps may be undercounted.
## What it does not do (known limits)

- Shows only daily maximum temperature. No humidity, heat index, minimum temperature or rainfall.
- No comparison between two cities yet.
- The cache never expires and each city takes about 480 kB, so after roughly ten cities localStorage fills up and caching stops silently.
- The app depends on one large request per city. On the free API tier, many reloads in a short time can trigger rate limiting.
- No automated tests.

## Preview
<img width="1224" height="361" alt="Screenshot 2026-10-07 161311" src="https://github.com/user-attachments/assets/6d9ffecd-ac62-4941-b43f-babc55e63e8f" />
<img width="1217" height="904" alt="Screenshot 2026-10-07 161344" src="https://github.com/user-attachments/assets/c1b24603-7677-4c66-a4e6-ba047ed10ad8" /> 

## Decisions
See [DECISIONS.md](DECISIONS.md) for the three main design decisions, the alternatives considered and what each one costs.

## Stack

React, JavaScript, Vite, Recharts.

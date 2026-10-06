# Climate Days

How many days per year exceed a chosen temperature in a given city, and is that number changing?

Pick any city, move the threshold slider (25-42 °C), and see a bar chart of days above the threshold per year (1950 to last full year) with a linear trend line.

**Live demo:** <URL-JA-NGA-VERCEL>

## Run locally

Requires Node.js 18+.

    git clone https://github.com/e-dedaj/climate-days.git
    cd climate-days
    npm install
    npm run dev

Open the URL printed in the terminal (usually http://localhost:5173). No API key is needed.

## Data source

[Open-Meteo](https://open-meteo.com): Geocoding API for city search and Historical Weather API (daily maximum temperature, `temperature_2m_max`).

## How failures are handled

- Every request has a timeout (15 s for search, 30 s for historical data) and shows a clear message.
- A failed data request shows an error with a "Try again" button.
- Responses are cached in localStorage so repeated visits do not hit the API again.
- Outdated responses are ignored if the user selects another city while one is loading.

## What this data does and does not support

- The historical data is **reanalysis** (a weather model fitted to observations), not readings from a thermometer in the city. Values for a specific day can differ from a local weather station.
- Each point represents a grid cell of roughly 10-25 km, so a coastal or mountain city may be represented by a nearby area with different temperatures.
- The trend line is a simple linear regression over the years. It describes how the count changed, **not why**. It does not prove a cause such as climate change, and it is not a forecast.
- With only a few hot days per year, single years are noisy. Compare decades, not neighbouring years.
- Missing values (null) are skipped, so a year with gaps may be undercounted.
- Comparing two cities is only meaningful if the same threshold is used and both are represented by similar grid cells.

## Stack

React, JavaScript, Vite, Recharts.
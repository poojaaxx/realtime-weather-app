# Realtime Weather App

A React + Vite + Material UI weather dashboard using the OpenWeatherMap REST API.

## Setup

Use Node.js 22.12+ (Node 24 recommended) and npm. From this folder:

```powershell
npm ci
Copy-Item .env.example .env
```

Edit `.env` locally and replace its placeholder with your OpenWeatherMap key. Never put a real key in `.env.example`, source files, screenshots, issues, or commits. The app reads `VITE_OPENWEATHER_API_KEY`. Restart Vite after changing it.

```powershell
npm run dev
```

Open the localhost URL shown by Vite. Chennai, IN loads by default. No valid key produces a configuration message; the application does not silently show sample weather.

## Features

- Controlled, labelled city search with whitespace/length validation and Enter submission. Add a country code, for example `London, GB`, to reduce ambiguity. The first geocoding match is used; its city name is retained even when the weather endpoint names a nearby reporting area.
- Current temperature, feels-like, humidity, wind in m/s, reporting-area min/max, country, description, weather icon, and last-updated time.
- Celsius/Fahrenheit control converts all displayed temperatures without refetching. Humidity remains percent and wind remains m/s in both modes.
- Red temperature above 30 C, blue below 10 C, frost background and winter icon at or below 0 C, and a storm icon for thunderstorms.
- Five-day forecast from [`/data/2.5/forecast`](https://openweathermap.org/api/forecast5): three-hour intervals grouped by the city's supplied UTC offset, beginning tomorrow. Each card uses the minimum/maximum of available intervals and the condition nearest local noon. Partial days have fewer than eight intervals and are labelled. Depending on the response, fewer than five upcoming dates may be available. These are interval summaries, not a separate daily forecast API. A fixed supplied offset cannot predict a future daylight-saving change.
- Current-location weather on explicit button click, with permission, timeout, unsupported-browser and unavailable-location feedback. City search remains available. Coordinates are not saved to history.
- Eight recent successful city searches in localStorage, case-insensitive deduplication, repeat-search buttons and clear-history action. Storage failures display a warning and leave the app usable.
- Loading, empty, error and success states; a forecast failure preserves current conditions. Request cancellation and sequence checks prevent stale search/location/forecast responses from replacing newer results. Each weather HTTP request has a 15-second timeout.

## Architecture and curriculum

`WeatherApp` owns shared weather, forecast, units, history and request state. `SearchBox` owns its controlled input and sends actions upward. `InfoBox`, `Forecast`, and `SearchHistory` receive props. API fetching and sanitization are in `src/services/weather.js`; grouping, geolocation and storage have separate services.

The supplied 10-page SapphireIQ curriculum was read and implemented in sequence:

| Module               | Implementation                                                                                                                                                               |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. MUI fundamentals  | Theme, responsive shell, Emotion and icons; `ButtonTest.jsx` contains the red Delete, green Submit and disabled outlined exercise buttons as an isolated teaching component. |
| 2. Search box        | Controlled `SearchBox`, trimmed validation, labels, helper text and keyboard submission.                                                                                     |
| 3. API integration   | Geocoding, current-weather fetch, sanitized data, wind/country fields and a fixed network fallback console message that never logs request URLs or keys.                     |
| 4. Info box          | Responsive Card/CardContent/CardMedia presentation, details and temperature color thresholds.                                                                                |
| 5. State lifting     | Root-owned state, callbacks, default-city load, last-updated timestamp and stale-response prevention.                                                                        |
| 6. Dynamic rendering | Conditional states, alerts, weather icons, frost styling and Celsius/Fahrenheit conversion.                                                                                  |

The PDF itself contains six modules and exercises; the forecast, geolocation and history dashboard extensions are implemented from the accompanying user request.

## Verification

```powershell
npm test
npm run build
npx playwright install chromium
npm run test:e2e
npm run format:check
```

Final verification passed: 31 Vitest tests, 10 Chromium desktop/mobile browser checks, the production build, and formatting checks. Desktop and mobile screenshots were also visually reviewed, including a 320-pixel overflow check.

Vitest tests use mocked fetch and geolocation responses: validation, normalization, configuration, HTTP/network/JSON errors, stale responses, temperature conversion, forecast timezone/date grouping and partial intervals, storage, and geolocation fallback/cancellation. Playwright tests run in Chromium at desktop and mobile sizes with mocked weather endpoints; they exercise layout, units, city errors, forecast failure, history persistence, and location permission paths. These tests do not verify live provider availability. Browser tests require a configured local key (the fetch responses remain mocked).

Live verification during implementation separately succeeded against OpenWeather current weather and forecast for Chennai, with 40 forecast intervals. Chromium also rendered live current conditions and forecast without mocked requests. The local key is never recorded in this README. Run the app to repeat live checks after configuring or rotating your key; check conditions, forecast and errors without sharing request URLs containing the key.

## Production and deployment

```powershell
npm run build
npm run preview
```

### Vercel Hobby deployment

`vercel.json` explicitly configures the Vite framework, `npm ci`, `npm run build`, `dist/`, and an SPA fallback for direct navigation and refresh. `.vercelignore` excludes local environment files, credentials, generated output and local test artifacts from uploads. `.vercel/` is ignored because it contains machine-specific account/project linkage.

Use a personal Vercel account on the free Hobby plan. Authenticate with `npx vercel login`, link this folder to the project with `npx vercel link`, then configure `VITE_OPENWEATHER_API_KEY` in the project's **Settings > Environment Variables** for **Production**. Enter the provider-authorized key there, never in chat or a command argument. The Vercel CLI's `vercel env add VITE_OPENWEATHER_API_KEY production` input flow is another option. Environment settings reduce accidental disclosure in configuration, but the built Vite frontend still exposes this key to visitors.

Deploy with `npx vercel --prod` from the linked workspace. A changed key requires a new deployment because Vite substitutes it at build time. A CLI deployment does not by itself configure automatic deployments from GitHub. No paid add-ons, custom domains or paid services are required.

Deploy `dist/` to a static host. Supply the environment variable in the build environment, then rebuild when it changes. `.env`, `.env.*`, `*.local`, generated output, dependencies and test artifacts are ignored; `.env.example` is deliberately tracked with only a placeholder.

**Vite environment variables are visible in the browser bundle and network requests.** This avoids committing the key but does not keep it private in a deployed frontend. For a public production app needing a private credential, put OpenWeather requests behind a server-side proxy with appropriate rate limits. Do not commit `dist/`, which can contain the configured key.

Geolocation needs HTTPS or localhost and browser permission. API keys may take time to activate; quotas and plan restrictions can produce 401, 403 or 429 messages. This app fetches on load and on user action; it does not continuously refresh. Weather icons load from OpenWeather; the text remains useful if images fail. Tested in Chromium; other browser engines have not been verified. Modern browsers supporting AbortSignal timeout/combination are required.

Commit authors use the user-confirmed GitHub identity, with no assistant or coauthor attribution.

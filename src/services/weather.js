const BASE = "https://api.openweathermap.org";
export class WeatherError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}
async function request(path, params, signal) {
  const key = import.meta.env.VITE_OPENWEATHER_API_KEY;
  if (!key || key === "your_openweathermap_api_key")
    throw new WeatherError(
      "Configure VITE_OPENWEATHER_API_KEY in your local .env file, then restart Vite.",
      "configuration",
    );
  const url = new URL(path, BASE);
  url.search = new URLSearchParams({ ...params, appid: key, units: "metric" });
  let response;
  try {
    response = await fetch(url, {
      signal: AbortSignal.any([
        ...(signal ? [signal] : []),
        AbortSignal.timeout(15000),
      ]),
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    if (error.name === "TimeoutError")
      throw new WeatherError(
        "Weather request timed out. Please try again.",
        "timeout",
      );
    console.warn("Weather request failed. Check your network connection.");
    throw new WeatherError(
      "Unable to connect. Check your connection and try again.",
      "network",
    );
  }
  if (!response.ok) {
    const messages = {
      401: "The API key is invalid or not active yet. Check your local configuration.",
      403: "Your API plan does not allow this request.",
      404: "City not found. Check the spelling or add a country code.",
      429: "Too many requests. Please wait before trying again.",
    };
    throw new WeatherError(
      messages[response.status] ||
        "Weather service is unavailable. Please try again later.",
      response.status,
    );
  }
  try {
    return await response.json();
  } catch {
    throw new WeatherError(
      "The weather service returned an unreadable response.",
      "response",
    );
  }
}
export function normalizeWeather(data) {
  const numbers = [
    data?.main?.temp,
    data?.main?.feels_like,
    data?.main?.temp_min,
    data?.main?.temp_max,
    data?.main?.humidity,
    data?.wind?.speed,
    data?.coord?.lat,
    data?.coord?.lon,
  ];
  if (
    !numbers.every(Number.isFinite) ||
    !data?.weather?.[0]?.description ||
    !data.name
  )
    throw new WeatherError(
      "The weather service returned incomplete data. Please try again.",
      "response",
    );
  return {
    city: data.name,
    country: data.sys?.country || "",
    temperature: data.main.temp,
    feelsLike: data.main.feels_like,
    min: data.main.temp_min,
    max: data.main.temp_max,
    humidity: data.main.humidity,
    windSpeed: data.wind.speed,
    description: data.weather[0].description,
    icon: data.weather[0].icon,
    condition: data.weather[0].main,
    coordinates: data.coord,
    timezone: data.timezone || 0,
    observedAt: data.dt,
  };
}
export async function getWeatherInfo(city, signal) {
  const locations = await request(
    "/geo/1.0/direct",
    { q: city, limit: 1 },
    signal,
  );
  if (!Array.isArray(locations))
    throw new WeatherError(
      "The location service returned incomplete data.",
      "response",
    );
  if (!locations.length)
    throw new WeatherError(
      "City not found. Check the spelling or add a country code.",
      404,
    );
  if (
    !Number.isFinite(locations[0]?.lat) ||
    !Number.isFinite(locations[0]?.lon)
  )
    throw new WeatherError(
      "The location service returned incomplete data.",
      "response",
    );
  const weather = await getWeatherByCoordinates(
    locations[0].lat,
    locations[0].lon,
    signal,
  );
  return {
    ...weather,
    city: locations[0].name || weather.city,
    country: locations[0].country || weather.country,
  };
}
export async function getWeatherByCoordinates(lat, lon, signal) {
  return normalizeWeather(
    await request("/data/2.5/weather", { lat, lon }, signal),
  );
}
export async function getForecast(lat, lon, signal) {
  const data = await request("/data/2.5/forecast", { lat, lon }, signal);
  if (
    !Array.isArray(data?.list) ||
    !Number.isFinite(data.city?.timezone) ||
    !data.list.every(
      (item) =>
        Number.isFinite(item?.dt) &&
        Number.isFinite(item.main?.temp_min) &&
        Number.isFinite(item.main?.temp_max) &&
        item.weather?.[0]?.description,
    )
  )
    throw new WeatherError(
      "The forecast service returned incomplete data.",
      "response",
    );
  return { list: data.list, timezone: data.city.timezone };
}

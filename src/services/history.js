export const HISTORY_KEY = "realtime-weather.history.v1";
export function readHistory() {
  try {
    const raw = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    return [
      ...new Set(
        raw
          .filter(
            (city) =>
              typeof city === "string" &&
              city.trim().length >= 2 &&
              city.length <= 100,
          )
          .map((city) => city.trim()),
      ),
    ].slice(0, 8);
  } catch {
    return [];
  }
}
export function addHistory(history, city) {
  return [
    city,
    ...history.filter(
      (item) => item.toLocaleLowerCase() !== city.toLocaleLowerCase(),
    ),
  ].slice(0, 8);
}
export function saveHistory(history) {
  try {
    if (history.length)
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    else localStorage.removeItem(HISTORY_KEY);
    return true;
  } catch {
    return false;
  }
}

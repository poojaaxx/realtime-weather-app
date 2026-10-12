export function groupForecast(list, offset, now = Date.now()) {
 const today = new Date(now + offset * 1000).toISOString().slice(0, 10); const groups = new Map();
 for (const item of [...list].sort((a,b) => a.dt - b.dt)) {
  const date = new Date((item.dt + offset) * 1000); const key = date.toISOString().slice(0, 10);
  if (key <= today) continue;
  if (!groups.has(key)) groups.set(key, []); groups.get(key).push({ ...item, localHour: date.getUTCHours() });
 }
 return [...groups.entries()].slice(0, 5).map(([date, entries]) => {
  const representative = entries.reduce((best, item) => Math.abs(item.localHour - 12) < Math.abs(best.localHour - 12) ? item : best);
  return { date, min: Math.min(...entries.map(item => item.main.temp_min)), max: Math.max(...entries.map(item => item.main.temp_max)), description: representative.weather[0].description, icon: representative.weather[0].icon, intervals: entries.length, partial: entries.length < 8 };
 });
}

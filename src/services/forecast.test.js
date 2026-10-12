import { it, expect } from 'vitest';
import { groupForecast } from './forecast';
const item = (time, min, max, description = 'clear') => ({ dt: Date.parse(time) / 1000, main: { temp_min: min, temp_max: max }, weather: [{ description, icon: '01d' }] });
it('uses local dates, excludes today, and labels partial intervals', () => { const days = groupForecast([item('2026-01-01T21:00:00Z', 10, 15), item('2026-01-02T06:00:00Z', 12, 20, 'cloudy'), item('2026-01-01T03:00:00Z', 5, 9)], 19800, Date.parse('2026-01-01T00:00:00Z')); expect(days).toHaveLength(1); expect(days[0]).toMatchObject({ date: '2026-01-02', min: 10, max: 20, description: 'cloudy', partial: true, intervals: 2 }); });
it('handles empty data and caps output to five upcoming dates', () => { expect(groupForecast([], 0)).toEqual([]); const items = Array.from({ length: 7 }, (_, index) => item(`2026-01-0${index+2}T12:00:00Z`, 10, 20)); expect(groupForecast(items, 0, Date.parse('2026-01-01'))).toHaveLength(5); });

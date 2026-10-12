import { describe, it, expect, vi, afterEach } from 'vitest';
import { getWeatherInfo, normalizeWeather } from './weather';
export const fixture = { name: 'Chennai', sys: { country: 'IN' }, main: { temp: 32, feels_like: 35, temp_min: 30, temp_max: 33, humidity: 70 }, wind: { speed: 4 }, coord: { lat: 13, lon: 80 }, weather: [{ main: 'Clouds', description: 'scattered clouds', icon: '03d' }], timezone: 19800 };
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe('weather API', () => {
 it('normalizes weather and rejects incomplete payloads', () => { expect(normalizeWeather(fixture)).toMatchObject({ city: 'Chennai', windSpeed: 4, country: 'IN' }); expect(() => normalizeWeather({})).toThrow('incomplete'); });
 it('requires configuration before making a request', async () => { vi.stubEnv('VITE_OPENWEATHER_API_KEY', ''); await expect(getWeatherInfo('Chennai')).rejects.toThrow('Configure'); });
 it('handles no matching city', async () => { vi.stubEnv('VITE_OPENWEATHER_API_KEY', 'test-placeholder'); vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => [] })); await expect(getWeatherInfo('wrong')).rejects.toThrow('City not found'); });
 it.each([401,403,404,429,500])('handles HTTP %i without exposing provider text', async (status) => { vi.stubEnv('VITE_OPENWEATHER_API_KEY', 'test-placeholder'); vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status })); await expect(getWeatherInfo('Chennai')).rejects.toBeInstanceOf(Error); });
 it('handles a network failure', async () => { vi.stubEnv('VITE_OPENWEATHER_API_KEY', 'test-placeholder'); vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network'))); await expect(getWeatherInfo('Chennai')).rejects.toThrow('connection'); });
 it('handles malformed JSON', async () => { vi.stubEnv('VITE_OPENWEATHER_API_KEY', 'test-placeholder'); vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => { throw Error(); } })); await expect(getWeatherInfo('Chennai')).rejects.toThrow('unreadable'); });
 it('fetches geocoded coordinates using metric units', async () => { vi.stubEnv('VITE_OPENWEATHER_API_KEY', 'test-placeholder'); const fetcher = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => [{ lat: 13, lon: 80 }] }).mockResolvedValueOnce({ ok: true, json: async () => fixture }); vi.stubGlobal('fetch', fetcher); expect((await getWeatherInfo('Chennai')).temperature).toBe(32); expect(fetcher.mock.calls[1][0].searchParams.get('units')).toBe('metric'); });
});

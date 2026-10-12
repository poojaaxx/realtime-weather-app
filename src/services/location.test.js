import { it, expect, vi, afterEach } from 'vitest';
import { getCurrentPosition } from './location';
afterEach(() => vi.unstubAllGlobals());
it('returns coordinates when location is permitted', async () => { vi.stubGlobal('navigator', { geolocation: { getCurrentPosition: success => success({ coords: { latitude: 13, longitude: 80 } }) } }); expect(await getCurrentPosition()).toMatchObject({ latitude: 13 }); });
it.each([1,2,3])('provides a city-search fallback for location error %i', async code => { vi.stubGlobal('navigator', { geolocation: { getCurrentPosition: (_, failure) => failure({ code }) } }); await expect(getCurrentPosition()).rejects.toThrow(/city/); });
it('handles unsupported browsers', async () => { vi.stubGlobal('navigator', {}); await expect(getCurrentPosition()).rejects.toThrow('unavailable'); });
it('cancels a pending location lookup', async () => { vi.stubGlobal('navigator', { geolocation: { getCurrentPosition: vi.fn() } }); const controller = new AbortController(); const promise = getCurrentPosition(controller.signal); controller.abort(); await expect(promise).rejects.toMatchObject({ name: 'AbortError' }); });

import { it, expect, vi, afterEach } from 'vitest';
import { readHistory, addHistory, saveHistory, HISTORY_KEY } from './history';
afterEach(() => { vi.unstubAllGlobals(); localStorage.clear(); });
it('deduplicates recent cities and caps history at eight', () => { expect(addHistory(['London', 'Chennai'], 'london')).toEqual(['london', 'Chennai']); expect(addHistory(Array.from({ length: 8 }, (_, i) => `City ${i}`), 'Paris')).toHaveLength(8); });
it('persists, restores and clears history', () => { expect(saveHistory(['Chennai'])).toBe(true); expect(readHistory()).toEqual(['Chennai']); saveHistory([]); expect(localStorage.getItem(HISTORY_KEY)).toBeNull(); });
it('handles corrupted storage and unsafe entries', () => { localStorage.setItem(HISTORY_KEY, 'bad json'); expect(readHistory()).toEqual([]); localStorage.setItem(HISTORY_KEY, JSON.stringify([null, 1, ' ', 'Paris'])); expect(readHistory()).toEqual(['Paris']); });
it('handles storage denied without crashing', () => { vi.stubGlobal('localStorage', { getItem: () => { throw Error(); }, setItem: () => { throw Error(); } }); expect(readHistory()).toEqual([]); expect(saveHistory(['Paris'])).toBe(false); });

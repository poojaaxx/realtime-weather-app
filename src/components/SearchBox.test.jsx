import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBox, { validateCity } from './SearchBox';
describe('city form', () => {
 it('rejects whitespace and short input', () => { expect(validateCity('   ')).toBeTruthy(); expect(validateCity(' a ')).toBeTruthy(); expect(validateCity(' Chennai ')).toBe(''); });
 it('submits a trimmed city with Enter', async () => { const callback = vi.fn(); render(<SearchBox onSearch={callback}/>); await userEvent.type(screen.getByLabelText('City name'), ' Chennai {Enter}'); expect(callback).toHaveBeenCalledWith('Chennai'); });
});

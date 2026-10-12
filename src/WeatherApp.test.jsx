import { it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WeatherApp from './WeatherApp';
vi.mock('./services/weather', () => ({ getWeatherInfo: vi.fn() }));
import { getWeatherInfo } from './services/weather';
const weather = (city) => ({ city, temperature: 20, feelsLike: 20, min: 18, max: 22, humidity: 60, windSpeed: 2, description: 'clear sky', icon: '01d' });
it('keeps the newest response when older requests finish later', async () => {
 let oldResolve; getWeatherInfo.mockReset().mockImplementationOnce(() => new Promise(resolve => { oldResolve = resolve; })).mockResolvedValueOnce(weather('London'));
 render(<WeatherApp/>); await userEvent.type(screen.getByLabelText('City name'), 'London{Enter}'); expect(await screen.findByRole('heading', { name: 'London' })).toBeInTheDocument(); await act(async () => { oldResolve(weather('Chennai')); }); expect(screen.queryByRole('heading', { name: 'Chennai' })).not.toBeInTheDocument();
});
it('renders API errors accessibly', async () => { getWeatherInfo.mockReset().mockRejectedValue(Error('City not found')); render(<WeatherApp/>); expect(await screen.findByRole('alert')).toHaveTextContent('City not found'); });

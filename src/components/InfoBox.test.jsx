import { it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import InfoBox, { temperatureText } from './InfoBox';
it('shows weather details and converts temperatures consistently', () => { render(<InfoBox weather={{ city: 'Chennai', country: 'IN', temperature: 32, feelsLike: 35, min: 30, max: 33, humidity: 70, windSpeed: 4, description: 'cloudy', icon: '03d' }}/>); expect(screen.getByText('70%')).toBeInTheDocument(); expect(screen.getByText('4 m/s')).toBeInTheDocument(); expect(temperatureText(0, 'F')).toBe('32\u00b0F'); });

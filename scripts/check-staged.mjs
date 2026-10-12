import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
const staged = execFileSync('git', ['diff', '--cached', '--name-only'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
if (staged.some(path => /(^|\/)(node_modules|dist|\.env)(\/|$)/.test(path) || /\.local$/.test(path))) throw new Error('Unintended local file staged');
const diff = execFileSync('git', ['diff', '--cached'], { encoding: 'utf8' });
if (existsSync('.env')) { const key = readFileSync('.env', 'utf8').match(/^VITE_OPENWEATHER_API_KEY\s*=\s*["']?([^\s"']+)/m)?.[1]; if (key && key !== 'your_openweathermap_api_key' && diff.includes(key)) throw new Error('Local key found in staged diff'); }
if (/VITE_OPENWEATHER_API_KEY\s*=\s*(?!your_openweathermap_api_key)[a-f0-9]{32}/i.test(diff)) throw new Error('Potential key found');
execFileSync('git', ['diff', '--cached', '--check'], { stdio: 'inherit' });
console.log('Staged files and secret scan passed:', staged.join(', '));

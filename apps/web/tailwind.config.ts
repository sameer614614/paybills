import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        accent: '#F59E0B',
        surface: '#F8FAFC'
      }
    }
  },
  plugins: []
};

export default config;

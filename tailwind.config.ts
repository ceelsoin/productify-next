import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds escuros
        background: {
          DEFAULT: '#0a0a0a',
          secondary: '#111111',
          tertiary: '#1a1a1a',
        },
        foreground: '#ededed',

        // Cores primárias (gradientes vibrantes)
        primary: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
          DEFAULT: '#d946ef',
        },

        accent: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          DEFAULT: '#3b82f6',
        },

        // Cores de sucesso/destaque
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          DEFAULT: '#22c55e',
        },

        // Textos e elementos
        text: {
          primary: '#ffffff',
          secondary: '#a1a1aa',
          tertiary: '#71717a',
          muted: '#52525b',
        },

        // Borders e dividers
        border: {
          DEFAULT: '#27272a',
          light: '#3f3f46',
        },

        // CTAs e botões principais
        cta: {
          DEFAULT: '#d946ef',
          hover: '#c026d3',
        },
      },

      // Gradientes prontos
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-hero':
          'linear-gradient(135deg, #d946ef 0%, #a855f7 50%, #3b82f6 100%)',
        'gradient-cta': 'linear-gradient(90deg, #d946ef 0%, #c026d3 100%)',
        'gradient-card':
          'linear-gradient(180deg, rgba(217, 70, 239, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
      },

      // Box shadows customizadas
      boxShadow: {
        'glow-primary': '0 0 20px rgba(217, 70, 239, 0.3)',
        'glow-accent': '0 0 20px rgba(59, 130, 246, 0.3)',
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
      },

      fontFamily: {
        sans: ['Manrope', 'Arial', 'Helvetica', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;

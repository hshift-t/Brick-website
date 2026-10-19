/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // ── Cosmic foundation ───────────────────────────────────────────
        void: {
          DEFAULT: '#06050C',
          900: '#06050C',
          800: '#0B0917',
          700: '#120E20',
        },
        // ── Glass system ────────────────────────────────────────────────
        glass: {
          DEFAULT: 'rgba(18, 14, 32, 0.55)',
          strong: 'rgba(18, 14, 32, 0.78)',
          soft: 'rgba(24, 18, 44, 0.4)',
        },
        // ── Brand ───────────────────────────────────────────────────────
        brand: {
          DEFAULT: '#8B5CF6', // Violet Pulse
          50: '#F5F3FF',
          200: '#D8C9FE',
          300: '#B79DFB',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
        },
        // ── Magnetar Glow (magnetic fusion) ─────────────────────────────
        magnetar: {
          violet: '#A855F7',
          magenta: '#EC4899',
        },
        // ── Accent tech cyan (data stream) ──────────────────────────────
        cyan: {
          DEFAULT: '#06B6D4',
          glow: '#22D3EE',
        },
        ink: {
          DEFAULT: '#F9FAFB',
          soft: '#9CA3AF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
        jakarta: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        mono: ['"Space Grotesk"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // Fluid display type — no layout jank between 320px and 4K.
        // The min clamp is deliberately conservative: the longest hero line
        // ("Extract & Preserve", 18 chars) must fit a 320px viewport inside
        // the 20px container gutters, so 1.75rem is the floor, not 2rem.
        'display-xl': [
          'clamp(1.75rem, 6.6vw, 5.5rem)',
          { lineHeight: '1.02', letterSpacing: '-0.04em' },
        ],
        'display-lg': ['clamp(1.75rem, 5vw, 4rem)', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'display-md': ['clamp(1.375rem, 3vw, 2.375rem)', { lineHeight: '1.14', letterSpacing: '-0.022em' }],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        glow: '0 0 25px rgba(139, 92, 246, 0.35)',
        'glow-sm': '0 0 14px rgba(139, 92, 246, 0.28)',
        'glow-cyan': '0 0 22px rgba(6, 182, 212, 0.28)',
        'glow-magenta': '0 0 26px rgba(236, 72, 153, 0.3)',
        'glass-inset': 'inset 0 1px 0 0 rgba(255,255,255,0.07), 0 24px 60px -30px rgba(0,0,0,0.9)',
        lift: '0 30px 70px -40px rgba(139, 92, 246, 0.55)',
      },
      backgroundImage: {
        'hairline':
          'linear-gradient(135deg, rgba(139,92,246,0.42) 0%, rgba(236,72,153,0.26) 38%, rgba(6,182,212,0.14) 62%, transparent 100%)',
        'edge-r':
          'linear-gradient(90deg, rgba(139,92,246,0.28) 0%, rgba(236,72,153,0.18) 45%, transparent 100%)',
        'brand-fill':
          'linear-gradient(115deg, #6D28D9 0%, #8B5CF6 32%, #A855F7 60%, #EC4899 100%)',
        'void-fade':
          'linear-gradient(180deg, rgba(6,5,12,0) 0%, rgba(6,5,12,0.85) 78%, #06050C 100%)',
      },
      keyframes: {
        // Slow, GPU-composited nebula drift (transform only — no repaint)
        'nebula-drift-a': {
          '0%,100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '50%': { transform: 'translate3d(6vw,-4vh,0) scale(1.12)' },
        },
        'nebula-drift-b': {
          '0%,100%': { transform: 'translate3d(0,0,0) scale(1.05)' },
          '50%': { transform: 'translate3d(-7vw,5vh,0) scale(1)' },
        },
        twinkle: {
          '0%,100%': { opacity: '0.25' },
          '50%': { opacity: '0.85' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.82)', opacity: '0.75' },
          '100%': { transform: 'scale(1.9)', opacity: '0' },
        },
        'magnetic-pulse': {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(168,85,247,0.45)' },
          '50%': { boxShadow: '0 0 0 14px rgba(168,85,247,0)' },
        },
        'scan-sweep': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '15%': { opacity: '1' },
          '85%': { opacity: '1' },
          '100%': { transform: 'translateY(100%)', opacity: '0' },
        },
        'sheen-sweep': {
          '0%': { transform: 'translateX(-120%) skewX(-18deg)' },
          '100%': { transform: 'translateX(220%) skewX(-18deg)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'gradient-x': {
          '0%,100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'nebula-a': 'nebula-drift-a 34s ease-in-out infinite',
        'nebula-b': 'nebula-drift-b 46s ease-in-out infinite',
        twinkle: 'twinkle 4s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 2.6s ease-out infinite',
        'magnetic-pulse': 'magnetic-pulse 2.8s ease-in-out infinite',
        'scan-sweep': 'scan-sweep 1.5s cubic-bezier(0.4,0,0.2,1) infinite',
        'sheen-sweep': 'sheen-sweep 2.4s ease-in-out infinite',
        marquee: 'marquee 42s linear infinite',
        'gradient-x': 'gradient-x 6s ease infinite',
        float: 'float 6s ease-in-out infinite',
      },
      transitionTimingFunction: {
        magnetic: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};

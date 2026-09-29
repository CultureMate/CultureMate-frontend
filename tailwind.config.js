module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Pretendard Variable"', 'Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', '"Apple SD Gothic Neo"', '"Noto Sans KR"', '"Malgun Gothic"', 'sans-serif'],
      },
      colors: {
        ink: { DEFAULT: '#191F28', soft: '#4E5968', muted: '#8B95A1' },
        coral: { DEFAULT: '#FF6B47', dark: '#E8552F', light: '#FFF0EC' },
        canvas: '#F7F7F5',
      },
      keyframes: {
        'splash-mark': {
          '0%': { opacity: '0', transform: 'scale(0.7) rotate(-8deg)' },
          '60%': { opacity: '1', transform: 'scale(1.06) rotate(2deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(0)' },
        },
        'splash-text': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'splash-mark': 'splash-mark 650ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'splash-text': 'splash-text 500ms 180ms ease-out both',
      },
      boxShadow: {
        card: '0 1px 2px rgba(25, 31, 40, 0.04), 0 4px 16px rgba(25, 31, 40, 0.06)',
        lift: '0 8px 28px rgba(25, 31, 40, 0.12)',
      },
    },
  },
  plugins: [],
}

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
      boxShadow: {
        card: '0 1px 2px rgba(25, 31, 40, 0.04), 0 4px 16px rgba(25, 31, 40, 0.06)',
        lift: '0 8px 28px rgba(25, 31, 40, 0.12)',
      },
    },
  },
  plugins: [],
}

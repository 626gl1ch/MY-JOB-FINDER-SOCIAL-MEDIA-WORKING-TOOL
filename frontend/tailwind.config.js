/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: "#121215",
        surface: "#1E1E26",
        surfaceHover: "#2A2A35",
        surface3: "#242430",
        hairline: "rgba(255,255,255,0.06)",
        ink: "#FFFFFF",
        muted: "#8E8E9F",
        dim: "#52525B",
        accent: "#B08BFF", // Soft Lilac/Purple
        accentHover: "#9D74FF",
        signal: "#4ADE80", // Neon Green
        signalDim: "#00331A",
        pulse: "#B08BFF", 
        pulseDim: "#2E2442",
        alert: "#F87171",
      },
      fontFamily: {
        display: ["'Inter'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      backgroundImage: {
        "glow-signal": "radial-gradient(circle, rgba(176,139,255,0.25) 0%, rgba(176,139,255,0) 70%)",
        "glow-pulse": "radial-gradient(circle, rgba(176,139,255,0.25) 0%, rgba(176,139,255,0) 70%)",
        "channel-split": "linear-gradient(90deg, #B08BFF 0%, #66B2FF 100%)",
        "accent-gradient": "linear-gradient(to right, #B08BFF, #66B2FF)",
      },
      boxShadow: {
        glass: "inset 0 1px 0 0 rgba(255,255,255,0.05)",
      },
      borderRadius: {
        '4xl': '32px',
        'squircle': '24px',
      }
    },
  },
  plugins: [],
};

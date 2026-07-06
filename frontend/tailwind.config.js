/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: "#0B0E14",
        surface: "#131722",
        surface2: "#1A1F2E",
        surface3: "#20263A",
        hairline: "rgba(228,231,236,0.08)",
        ink: "#E4E7EC",
        muted: "#8B93A7",
        dim: "#5C6478",
        signal: "#43FFB0",
        signalDim: "#1F5C46",
        pulse: "#8B7CFF",
        pulseDim: "#332A66",
        alert: "#FF5C7A",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      backgroundImage: {
        "glow-signal": "radial-gradient(circle, rgba(67,255,176,0.35) 0%, rgba(67,255,176,0) 70%)",
        "glow-pulse": "radial-gradient(circle, rgba(139,124,255,0.35) 0%, rgba(139,124,255,0) 70%)",
        "channel-split": "linear-gradient(90deg, #43FFB0 0%, #8B7CFF 100%)",
      },
      boxShadow: {
        glass: "inset 0 1px 0 0 rgba(255,255,255,0.04)",
      },
    },
  },
  plugins: [],
};

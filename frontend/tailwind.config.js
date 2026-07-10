/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: "#05050A",
        surface: "#0A0A14",
        surface2: "#10101F",
        surface3: "#18182B",
        hairline: "rgba(255,255,255,0.06)",
        ink: "#F8F9FA",
        muted: "#A1A1AA",
        dim: "#52525B",
        signal: "#00E5FF", // Neon Cyan
        signalDim: "#00333D",
        pulse: "#D900FF", // Electric Violet
        pulseDim: "#33003D",
        alert: "#FF2A5F",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      backgroundImage: {
        "glow-signal": "radial-gradient(circle, rgba(0,229,255,0.25) 0%, rgba(0,229,255,0) 70%)",
        "glow-pulse": "radial-gradient(circle, rgba(217,0,255,0.25) 0%, rgba(217,0,255,0) 70%)",
        "channel-split": "linear-gradient(90deg, #00E5FF 0%, #D900FF 100%)",
      },
      boxShadow: {
        glass: "inset 0 1px 0 0 rgba(255,255,255,0.05)",
      },
    },
  },
  plugins: [],
};

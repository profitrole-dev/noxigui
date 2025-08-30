module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      borderRadius: { xl: "12px", "2xl": "16px" },
      boxShadow: { subtle: "0 1px 0 rgba(255,255,255,0.04) inset" },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        noxi: {
          primary: "#8B5CF6",
          secondary: "#22D3EE",
          accent: "#A78BFA",
          neutral: "#1a1b22",
          "base-100": "#0f1015",
          "base-200": "#14151c",
          "base-300": "#1e2029",
          info: "#38bdf8",
          success: "#22c55e",
          warning: "#f59e0b",
          error: "#ef4444",
          "--rounded-box": "12px",
          "--rounded-btn": "10px",
          "--tab-radius": "8px",
        },
      },
    ],
  },
};

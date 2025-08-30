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
        cappuccin: {
          primary: "#b4befe",
          secondary: "#94e2d5",
          accent: "#f5c2e7",
          neutral: "#11111b",
          "base-100": "#1e1e2e",
          "base-200": "#181825",
          "base-300": "#11111b",
          info: "#89b4fa",
          success: "#a6e3a1",
          warning: "#f9e2af",
          error: "#f38ba8",
          "--rounded-box": "12px",
          "--rounded-btn": "10px",
          "--tab-radius": "8px",
        },
      },
    ],
  },
};

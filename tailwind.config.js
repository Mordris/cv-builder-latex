/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}", // Ensure it scans .vue files
  ],
  theme: {
    extend: {
      // Add custom theme extensions here if needed
    },
  },
  plugins: [
    // Add plugins like @tailwindcss/forms if you use them
  ],
};

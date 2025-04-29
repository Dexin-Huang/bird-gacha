/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',  // <-- include *every* folder you author in
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: { extend: {} },
  plugins: [
    require('@tailwindcss/typography')   // you use “prose” on the home page
  ]
}

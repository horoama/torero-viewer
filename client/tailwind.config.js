/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'trello-list': '#f1f2f4',
        'trello-text': '#172b4d',
        'trello-gray': '#091e420f', // hover effect
        'trello-icon': '#44546f',
      },
      boxShadow: {
        'trello-card': '0px 1px 1px #091e4240, 0px 0px 1px #091e424f',
        'trello-card-hover': '0px 1px 1px #091e4240, 0px 0px 1px #091e424f, 0 0 0 2px #388bff', // example focus
      },
      width: {
        'trello-list': '272px',
      }
    },
  },
  plugins: [],
}

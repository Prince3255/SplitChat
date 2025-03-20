import daisyui from "daisyui"
import scrollbar from "tailwind-scrollbar"
// const flowbite = require("flowbite-react/tailwind");
import flowbite from "flowbite-react/tailwind";
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    flowbite.content()
  ],
  theme: {
    extend: {},
  },
  plugins: [daisyui, flowbite.plugin(), scrollbar],
}


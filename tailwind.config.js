/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {},
    colors: {
      
        'dark-content': '#DAE2F1',
        'dark-result': '#DAE2F1',
        'dark-background': '#1E2B4D',
        'dark-primary': '#1A1F32',
        'dark-secondary': '#070A12',
        'dark-accent': {
          1: '#C39A32',
          2: '#A17D21',
        },
        
        'light-content': '#0E1625',
        'light-result': '#0E1625',
        'light-background': '#D9E2FC',
        'light-primary': '#CDD1E5',
        'light-secondary': '#EDF0F8',
        'light-accent': {
          1: '#0234CA',
          2: '#012389',
        },
      
        'danger': {
          1: '#CA0000',
          2: '#7A0000',
        },
      
     },
     flexGrow: {
      2: '2',
      3: '3'
    },
     
  },
  plugins: [],

}


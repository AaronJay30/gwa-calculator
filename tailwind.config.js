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
        
        'light-content': '#182230',
        'light-result': '#182230',
        'light-background': '#F4F6F9',
        'light-primary': '#FFFFFF',
        'light-secondary': '#EEF1F5',
        'light-accent': {
          1: '#4F73C4',
          2: '#3F62B4',
        },
        'light-accent-text': '#FFFFFF',
      
        'danger': {
          1: '#CA0000',
          2: '#7A0000',
          3: '#FF8A8A',
        },
      
     },
     flexGrow: {
      2: '2',
      3: '3'
    },
     
  },
  plugins: [],

}


# Weather Dashboard

A modern weather dashboard built with React + Vite, Tailwind CSS, and Framer Motion.

The app provides:

- City search with live weather data
- 5-day forecast cards
- Unit toggle (Celsius/Fahrenheit)
- UV index, humidity, wind speed, and weather description
- Glassmorphism UI with dynamic weather-based gradient themes
- Smooth animated transitions for first load and city changes

## Tech Stack

- React 19
- Vite 8
- Tailwind CSS 3
- Framer Motion
- Axios
- OpenWeather API (current weather + forecast)
- Open-Meteo API (UV index)

## Project Structure

- src/App.jsx: Main page, data fetching, state management, layout
- src/components/WeatherCard.jsx: Reusable forecast card
- src/index.css: Tailwind imports + custom glass/theme utility classes
- tailwind.config.js: Tailwind content paths and theme extension

## Prerequisites

- Node.js 18+
- npm 9+
- OpenWeather API key

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create or update .env in the project root:

```env
VITE_OPENWEATHER_API_KEY=your_openweather_api_key_here
```

3. Start development server:

```bash
npm run dev
```

4. Open:

```text
http://localhost:5173
```

## Available Scripts

- npm run dev: Start Vite development server
- npm run build: Create production build
- npm run preview: Preview production build locally
- npm run lint: Run ESLint checks

## API Notes

- Weather and forecast data are fetched from OpenWeather endpoints:
	- /data/2.5/weather
	- /data/2.5/forecast
- UV index is fetched from Open-Meteo using city coordinates.
- If UV API fails, the app gracefully shows N/A and still renders weather data.

## UI/UX Highlights

- Glass cards use:
	- backdrop blur
	- semi-transparent backgrounds
	- subtle white borders
- Animated behaviors:
	- Staggered fade/slide-in on initial load
	- AnimatePresence transitions when changing cities
	- Hover lift/scale on forecast cards
	- Pulse effect on current temperature
- Responsive behavior:
	- Mobile-first single-column layout
	- Sticky search bar
	- Desktop split grid for hero + forecast panel

## Troubleshooting

- Error: Missing API key
	- Ensure .env contains VITE_OPENWEATHER_API_KEY
	- Restart the dev server after changing .env

- Error: City not found
	- Check spelling
	- Try searching with country suffix, for example: Kolkata,IN

- No UI updates after code change
	- Restart dev server: npm run dev

## License

For personal or educational use. Add your preferred license if publishing publicly.

import { useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { AnimatePresence, motion } from 'framer-motion'
import WeatherCard from './components/WeatherCard'

const OPEN_WEATHER_BASE = 'https://api.openweathermap.org/data/2.5'
const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: 'beforeChildren',
      staggerChildren: 0.12,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: 'easeOut' },
  },
}

function formatDayLabel(timestamp) {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    weekday: 'short',
  })
}

function buildFiveDayForecast(entries) {
  const selectedByDate = new Map()

  for (const entry of entries) {
    const dateKey = entry.dt_txt.split(' ')[0]

    if (!selectedByDate.has(dateKey)) {
      selectedByDate.set(dateKey, entry)
      continue
    }

    const current = selectedByDate.get(dateKey)
    const currentHour = Number(current.dt_txt.split(' ')[1].split(':')[0])
    const entryHour = Number(entry.dt_txt.split(' ')[1].split(':')[0])

    if (Math.abs(12 - entryHour) < Math.abs(12 - currentHour)) {
      selectedByDate.set(dateKey, entry)
    }
  }

  return Array.from(selectedByDate.values()).slice(0, 5)
}

function getThemeClass(main, icon) {
  const normalized = (main || '').toLowerCase()
  const isNight = icon?.includes('n')

  if (normalized.includes('clear') && !isNight) {
    return 'theme-clear-day'
  }

  if (normalized.includes('clear') && isNight) {
    return 'theme-clear-night'
  }

  if (normalized.includes('rain') || normalized.includes('drizzle')) {
    return 'theme-rain'
  }

  if (normalized.includes('snow')) {
    return 'theme-snow'
  }

  if (normalized.includes('cloud')) {
    return isNight ? 'theme-cloud-night' : 'theme-cloud-day'
  }

  if (normalized.includes('thunderstorm')) {
    return 'theme-storm'
  }

  return isNight ? 'theme-default-night' : 'theme-default-day'
}

function App() {
  const [query, setQuery] = useState('Kolkata')
  const [city, setCity] = useState('Kolkata')
  const [unit, setUnit] = useState('metric')
  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const searchInputRef = useRef(null)

  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY

  const unitLabel = useMemo(() => (unit === 'metric' ? 'C' : 'F'), [unit])

  useEffect(() => {
    searchInputRef.current?.focus()
  }, [])

  useEffect(() => {
    const fetchWeather = async () => {
      if (!apiKey) {
        setError('Missing API key. Add VITE_OPENWEATHER_API_KEY to your .env file.')
        return
      }

      setLoading(true)
      setError('')

      try {
        const [currentResponse, forecastResponse] = await Promise.all([
          axios.get(`${OPEN_WEATHER_BASE}/weather`, {
            params: {
              q: city,
              appid: apiKey,
              units: unit,
            },
          }),
          axios.get(`${OPEN_WEATHER_BASE}/forecast`, {
            params: {
              q: city,
              appid: apiKey,
              units: unit,
            },
          }),
        ])

        const { lat, lon } = currentResponse.data.coord
        let uvIndex = null

        try {
          const uvResponse = await axios.get(OPEN_METEO_BASE, {
            params: {
              latitude: lat,
              longitude: lon,
              current: 'uv_index',
              timezone: 'auto',
            },
          })

          uvIndex = uvResponse.data?.current?.uv_index ?? null
        } catch {
          uvIndex = null
        }

        setWeather({
          ...currentResponse.data,
          uvIndex,
        })
        setForecast(buildFiveDayForecast(forecastResponse.data.list))
      } catch (requestError) {
        if (requestError?.response?.status === 404) {
          setError('City not found. Try another city name.')
        } else {
          setError('Unable to fetch weather data right now. Please try again.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
  }, [apiKey, city, unit])

  const onSearch = (event) => {
    event.preventDefault()

    const nextCity = query.trim()
    if (!nextCity) {
      setError('Please enter a city name.')
      return
    }

    setCity(nextCity)
  }

  const themeClass = getThemeClass(weather?.weather?.[0]?.main, weather?.weather?.[0]?.icon)

  return (
    <main className={`min-h-screen text-slate-100 weather-theme ${themeClass}`}>
      <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-4 sm:px-6 lg:px-8">
        <motion.form
          onSubmit={onSearch}
          className="glass-card sticky top-3 z-30 mb-6 flex flex-col gap-3 p-3 sm:flex-row sm:items-center"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search city..."
            className="w-full rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-base text-white placeholder:text-slate-200/80 outline-none transition focus:border-cyan-200/90 focus:ring-2 focus:ring-cyan-200/60"
          />
          <div className="flex gap-3">
            <button type="submit" className="glass-button min-w-24">
              Search
            </button>
            <button
              type="button"
              className="glass-button min-w-24"
              onClick={() => setUnit((prev) => (prev === 'metric' ? 'imperial' : 'metric'))}
            >
              {unit === 'metric' ? 'Celsius' : 'Fahrenheit'}
            </button>
          </div>
        </motion.form>

        {error ? (
          <p className="glass-card border-rose-200/40 bg-rose-500/20 p-4 text-sm font-medium text-rose-100">
            {error}
          </p>
        ) : null}

        {loading ? (
          <div className="mt-10 flex items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/30 border-t-white" />
          </div>
        ) : null}

        <AnimatePresence mode="wait">
          {!loading && weather ? (
            <motion.section
              key={`${weather.id}-${city}-${unit}`}
              className="mt-4 grid grid-cols-1 gap-6 xl:grid-cols-12"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, x: -32, transition: { duration: 0.28 } }}
            >
              <motion.article
                variants={itemVariants}
                className="glass-card xl:col-span-7 p-6 md:p-8"
              >
                <p className="text-sm uppercase tracking-[0.25em] text-slate-200/80">
                  Current Weather
                </p>
                <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">
                  {weather.name}, {weather.sys?.country}
                </h1>

                <div className="mt-5 flex flex-wrap items-end gap-4">
                  <p className="animate-pulse text-6xl font-bold sm:text-7xl">
                    {Math.round(weather.main.temp)}{String.fromCharCode(176)}{unitLabel}
                  </p>
                  <img
                    src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                    alt={weather.weather[0].description}
                    className="h-20 w-20"
                  />
                </div>

                <p className="mt-2 text-lg capitalize text-slate-100/95">
                  {weather.weather[0].description}
                </p>

                <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="metric-pill">
                    <span>Humidity</span>
                    <strong>{weather.main.humidity}%</strong>
                  </div>
                  <div className="metric-pill">
                    <span>Wind</span>
                    <strong>
                      {Math.round(weather.wind.speed)} {unit === 'metric' ? 'm/s' : 'mph'}
                    </strong>
                  </div>
                  <div className="metric-pill">
                    <span>UV Index</span>
                    <strong>
                      {weather.uvIndex !== null ? Number(weather.uvIndex).toFixed(1) : 'N/A'}
                    </strong>
                  </div>
                  <div className="metric-pill">
                    <span>Feels Like</span>
                    <strong>
                      {Math.round(weather.main.feels_like)}{String.fromCharCode(176)}{unitLabel}
                    </strong>
                  </div>
                </div>
              </motion.article>

              <motion.aside variants={itemVariants} className="xl:col-span-5">
                <div className="glass-card p-6 md:p-7">
                  <h2 className="text-2xl font-semibold">5-Day Forecast</h2>
                  <p className="mt-1 text-sm text-slate-100/75">
                    Hover over a card for details.
                  </p>

                  <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {forecast.map((item) => (
                      <WeatherCard
                        key={item.dt}
                        day={formatDayLabel(item.dt)}
                        icon={item.weather[0].icon}
                        description={item.weather[0].description}
                        temperature={Math.round(item.main.temp)}
                        humidity={item.main.humidity}
                        wind={Math.round(item.wind.speed)}
                        unitLabel={unitLabel}
                        unit={unit}
                      />
                    ))}
                  </div>
                </div>
              </motion.aside>
            </motion.section>
          ) : null}
        </AnimatePresence>
      </div>
    </main>
  )
}

export default App

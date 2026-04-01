import { motion } from 'framer-motion'

function WeatherCard({
  day,
  icon,
  description,
  temperature,
  humidity,
  wind,
  unitLabel,
  unit,
}) {
  return (
    <motion.article
      whileHover={{ scale: 1.03, y: -2 }}
      transition={{ type: 'spring', stiffness: 220, damping: 17 }}
      className="glass-card p-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold tracking-wide text-slate-100/90">{day}</p>
        <img
          src={`https://openweathermap.org/img/wn/${icon}.png`}
          alt={description}
          className="h-10 w-10"
        />
      </div>

      <p className="mt-1 capitalize text-slate-100/85">{description}</p>
      <p className="mt-3 text-3xl font-bold">
        {temperature}{String.fromCharCode(176)}{unitLabel}
      </p>

      <div className="mt-3 flex items-center justify-between text-sm text-slate-100/80">
        <span>Humidity: {humidity}%</span>
        <span>
          Wind: {wind} {unit === 'metric' ? 'm/s' : 'mph'}
        </span>
      </div>
    </motion.article>
  )
}

export default WeatherCard

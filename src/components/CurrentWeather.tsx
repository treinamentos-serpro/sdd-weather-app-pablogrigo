import { formatTemperature } from '../lib/temperature';
import { getWeatherInfo } from '../lib/weatherCodes';
import type { City, CurrentWeather as CurrentWeatherData, Unit } from '../types/weather';

interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherData;
  unit: Unit;
}

export default function CurrentWeather({ city, current, unit }: CurrentWeatherProps) {
  const location = [city.admin1, city.country].filter(Boolean).join(', ');
  const condition = current.weatherCode === null ? null : getWeatherInfo(current.weatherCode);
  const updateTime = current.localTime?.match(/T(\d{2}:\d{2})/)?.[1] ?? null;
  const observedAt = current.observedAt === null ? Number.NaN : Date.parse(current.observedAt);
  const hasVerifiedTimestamp = updateTime !== null && Number.isFinite(observedAt);
  const isOutdated = hasVerifiedTimestamp && Date.now() - observedAt > 60 * 60 * 1000;
  const metrics = [
    { label: 'Umidade', value: current.humidityPercent, suffix: '%' },
    { label: 'Vento', value: current.windSpeedKmh, suffix: 'km/h' },
    { label: 'Precipitação', value: current.precipitationMm, suffix: 'mm' },
    { label: 'Pressão', value: current.pressureHpa, suffix: 'hPa' },
  ];

  return (
    <section
      aria-label="Clima atual"
      className="w-full border-y border-white/10 bg-white/5 px-4 py-8 text-white backdrop-blur-md sm:px-6"
    >
      <div className="mx-auto max-w-5xl md:flex md:items-center md:justify-between md:gap-8">
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold">{city.name}</h2>
          {location && <p className="text-white/70">{location}</p>}
          {current.temperatureC === null && condition === null ? (
            <p className="mt-6 text-white/70">Condições atuais indisponíveis</p>
          ) : (
            <div className="mt-6 flex min-w-0 items-center gap-4">
              {condition && (
                <span role="img" aria-label={condition.label} className="text-5xl">
                  {condition.icon}
                </span>
              )}
              <p
                className={
                  current.temperatureC === null
                    ? 'min-w-0 text-xl font-medium'
                    : 'text-6xl font-light sm:text-7xl'
                }
              >
                {current.temperatureC === null
                  ? 'Indisponível'
                  : formatTemperature(current.temperatureC, unit)}
              </p>
            </div>
          )}
          <p className="mt-2 text-white/70">{condition?.label ?? 'Condição indisponível'}</p>
          <p className="mt-4 text-sm text-white/70">
            {updateTime
              ? `Horário de atualização: ${updateTime}`
              : 'Horário de atualização não informado'}
          </p>
          {!hasVerifiedTimestamp && (
            <p className="text-sm text-white/70">Atualidade não verificada</p>
          )}
          {isOutdated && <p className="text-sm text-white/70">Desatualizado</p>}
        </div>
        <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 md:mt-0 md:min-w-72">
          {metrics.map(({ label, value, suffix }) => (
            <div key={label} className="border-t border-white/10 pt-3">
              <dt className="text-sm text-white/70">{label}</dt>
              <dd className="mt-1 font-medium">
                {value == null ? 'Indisponível' : `${value} ${suffix}`}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

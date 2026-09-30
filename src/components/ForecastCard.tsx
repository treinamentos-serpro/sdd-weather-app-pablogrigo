import { getDayLabel, getShortDate } from '../lib/format';
import { formatTemperature } from '../lib/temperature';
import { getWeatherInfo } from '../lib/weatherCodes';
import type { ForecastDay, Unit } from '../types/weather';

interface ForecastCardProps {
  day: ForecastDay;
  index: number;
  unit: Unit;
}

export default function ForecastCard({ day, index, unit }: ForecastCardProps) {
  const condition = day.weatherCode === null ? null : getWeatherInfo(day.weatherCode);

  return (
    <li className="flex min-w-0 flex-col items-center rounded-lg border border-white/10 bg-white/5 px-3 py-4 text-center text-white backdrop-blur-md">
      <p className="font-semibold">{getDayLabel(day.date, index)}</p>
      <p className="text-xs text-white/70">{getShortDate(day.date)}</p>
      {condition && (
        <span role="img" aria-label={condition.label} className="mt-3 text-3xl">
          {condition.icon}
        </span>
      )}
      <p className="mt-2 text-sm text-white/70">{condition?.label ?? 'Indisponível'}</p>
      <dl className="mt-3 flex w-full flex-wrap justify-center gap-x-3 gap-y-1 text-sm">
        <div>
          <dt className="text-white/70">Máx</dt>
          <dd className="font-semibold">
            {day.maximumC === null ? 'Indisponível' : formatTemperature(day.maximumC, unit)}
          </dd>
        </div>
        <div>
          <dt className="text-white/70">Mín</dt>
          <dd>{day.minimumC === null ? 'Indisponível' : formatTemperature(day.minimumC, unit)}</dd>
        </div>
      </dl>
      <p className="mt-3 text-xs text-white/70">
        Chance de chuva:{' '}
        {day.precipitationProbabilityPercent == null
          ? 'Indisponível'
          : `${day.precipitationProbabilityPercent}%`}
      </p>
      <p className="text-xs text-white/70">
        Acumulado:{' '}
        {day.precipitationSumMm == null ? 'Indisponível' : `${day.precipitationSumMm} mm`}
      </p>
    </li>
  );
}

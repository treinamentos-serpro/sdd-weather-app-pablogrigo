import type { City, ForecastDay, Unit } from '../types/weather';
import ForecastCard from './ForecastCard';

interface ForecastListProps {
  forecast: ForecastDay[];
  unit: Unit;
  city?: City;
  timezone?: string | null;
}

export default function ForecastList({ forecast, unit, city, timezone }: ForecastListProps) {
  return (
    <section aria-label="Previsão de 5 dias" className="w-full text-white">
      <h2 className="mb-1 text-xl font-semibold">Previsão de 5 dias</h2>
      {city && <p className="mb-4 text-sm text-white/70">{city.name}</p>}
      {timezone === null ? (
        <p>Previsão indisponível: fuso horário não informado</p>
      ) : forecast.length === 0 ? (
        <p>Previsão indisponível</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {forecast.map((day, index) => (
            <ForecastCard key={day.date} day={day} index={index} unit={unit} />
          ))}
        </ul>
      )}
    </section>
  );
}

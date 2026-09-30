import type { City } from '../types/weather';

interface CityResultsProps {
  cities: City[];
  onSelect: (city: City) => void;
  disabled?: boolean;
}

function getCityContext(city: City): string {
  return [city.admin1, city.admin2, city.country].filter(Boolean).join(', ');
}

export default function CityResults({ cities, onSelect, disabled = false }: CityResultsProps) {
  return (
    <section aria-labelledby="city-results-title" className="mx-auto max-w-2xl">
      <h2 id="city-results-title" className="text-xl font-semibold">
        Escolha uma cidade
      </h2>
      <p className="mt-1 text-sm text-white/70">Encontramos {cities.length} correspondência(s).</p>
      <ul aria-label="Cidades encontradas" className="mt-4 space-y-3">
        {cities.map((city) => {
          const context = getCityContext(city);
          const label = context ? `${city.name}, ${context}` : city.name;
          const key = city.id ?? `${city.latitude}-${city.longitude}-${city.name}`;
          return (
            <li key={key}>
              <button
                type="button"
                onClick={() => onSelect(city)}
                disabled={disabled}
                className="min-h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-left backdrop-blur-md transition-colors hover:border-accent-400 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label={`Selecionar ${label}`}
              >
                <span className="block font-semibold">{city.name}</span>
                {context && <span className="block text-sm text-white/70">{context}</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

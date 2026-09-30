interface LoadingStateProps {
  phase?: 'search' | 'weather';
  cityName?: string;
}

export default function LoadingState({ phase = 'weather', cityName }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center gap-3 py-12 text-center text-white"
    >
      <span
        aria-hidden="true"
        className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-accent-400 motion-reduce:animate-none"
      />
      <p>
        {phase === 'search'
          ? 'Buscando cidades…'
          : `Carregando o clima${cityName ? ` de ${cityName}` : ''}…`}
      </p>
    </div>
  );
}

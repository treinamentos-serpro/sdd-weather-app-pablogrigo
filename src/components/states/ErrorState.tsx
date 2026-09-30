interface ErrorStateProps {
  message: string;
  onRetry: () => void;
  onNewSearch?: () => void;
}

export default function ErrorState({ message, onRetry, onNewSearch }: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col items-center gap-4 py-12 text-center text-white">
      <h2 className="text-lg font-semibold">Não foi possível concluir a consulta</h2>
      {message !== 'Não foi possível concluir a consulta' && (
        <p className="text-white/80">{message}</p>
      )}
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="min-h-11 rounded-md bg-accent-500 px-4 text-sm font-semibold text-night-900 transition-colors hover:bg-accent-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400"
        >
          Tentar novamente
        </button>
        {onNewSearch && (
          <button
            type="button"
            onClick={onNewSearch}
            className="min-h-11 rounded-md border border-white/20 bg-white/5 px-4 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400"
          >
            Nova busca
          </button>
        )}
      </div>
    </div>
  );
}

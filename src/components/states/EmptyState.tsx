interface EmptyStateProps {
  title?: string;
  hint?: string;
}

export default function EmptyState({
  title = 'Nenhuma cidade encontrada',
  hint = 'Tente buscar por outro nome de cidade.',
}: EmptyStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center gap-2 py-12 text-center text-white"
    >
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-white/70">{hint}</p>
    </div>
  );
}

const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function getDayLabel(date: string, index: number): string {
  if (index === 0) return 'Hoje';
  if (index === 1) return 'Amanhã';

  const [year, month, day] = date.split('-').map(Number);
  return weekdays[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
}

export function getShortDate(date: string): string {
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
}

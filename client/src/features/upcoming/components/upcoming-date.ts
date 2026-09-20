const locale = typeof navigator === 'undefined' ? 'en-US' : navigator.language;

const millisecondsPerDay = 24 * 60 * 60 * 1000;
const utcDateOnly = (date: Date) => date.toISOString().slice(0, 10);
const dateValue = (date: string) => Date.parse(`${date}T00:00:00.000Z`);

export const formatUpcomingDate = (date: string) =>
  new Intl.DateTimeFormat(locale, {
    dateStyle: 'full',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00.000Z`));

export const formatUpcomingRelativeDate = (date: string, today = utcDateOnly(new Date())) => {
  const days = Math.round((dateValue(date) - dateValue(today)) / millisecondsPerDay);

  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return 'Yesterday';
  if (days < 0) return `${Math.abs(days)} days ago`;
  return `In ${days} days`;
};

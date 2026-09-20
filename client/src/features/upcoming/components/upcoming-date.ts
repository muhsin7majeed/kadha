const locale = typeof navigator === 'undefined' ? 'en-US' : navigator.language;

export const formatUpcomingDate = (date: string) =>
  new Intl.DateTimeFormat(locale, {
    dateStyle: 'full',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00.000Z`));

import dayjs from 'dayjs';

export const formatDate = (date: string, format: string = 'DD MMMM YYYY') => {
  return dayjs(date).format(format);
};

export const minutesToHours = (minutes: number) => {
  if (!minutes || minutes === 0) return '0m';

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${hours}h ${mins}m`;
};

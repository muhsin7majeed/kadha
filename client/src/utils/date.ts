import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export const formatDate = (date: string | undefined, format: string = 'DD MMMM YYYY') => {
  if (!date) return 'N/A';

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

export const formatTimeAgo = (date: string) => {
  return dayjs(date).fromNow();
};

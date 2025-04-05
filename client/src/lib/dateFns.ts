import dayjs from 'dayjs';

export const formatDate = (date: string, format: string = 'DD MMMM YYYY') => {
  return dayjs(date).format(format);
};

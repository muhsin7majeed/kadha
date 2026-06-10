/**
 * @description Capitalizes the first letter in given string
 * @example capitalize("hakuna") => "Hakuna"
 */
export const capitalize = (value: string): string => {
  if (typeof value !== 'string') {
    console.warn('capitalize | input is not a string');
    return value;
  }

  return value.replace(/^./, (char) => char.toUpperCase());
};

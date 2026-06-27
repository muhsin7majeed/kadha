/**
 * @description Capitalizes the first letter in given string
 * @example capitalize("hakuna") => "Hakuna"
 */
export const capitalize = (value: string): string => {
  return value.replace(/^./, (char) => char.toUpperCase());
};

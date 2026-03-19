/**
 * Capitalizes the first letter of a string and converts the rest to lowercase.
 * @example
 * capitalize("hello") // Returns "Hello"
 * capitalize("WORLD") // Returns "World"
 * @throws {Error} If the input is not a valid non-empty string.
 */
const capitalize = (input: string) => {
  if (input.length === 0) return '';
  if (typeof input !== 'string') throw new Error('Input must be a string');

  const lower = input.toLowerCase();

  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

export default capitalize;

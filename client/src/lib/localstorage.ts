export const LOCALSTORAGE_KEYS = {
  REFRESH_TOKEN: 'refreshToken',
  TOKEN: 'token',
  USER: 'user',
};

export const storeToken = (token: string) => localStorage.setItem(LOCALSTORAGE_KEYS.TOKEN, token);
export const getStoredToken = () => localStorage.getItem(LOCALSTORAGE_KEYS.TOKEN);
export const removeStoredToken = () => localStorage.removeItem(LOCALSTORAGE_KEYS.TOKEN);

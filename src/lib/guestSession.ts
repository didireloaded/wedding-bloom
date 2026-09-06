const keyFor = (weddingId: string) => `forevervow-guest-session-${weddingId}`;
export const saveGuestSessionToken = (weddingId: string, token: string) => {
  localStorage.setItem(keyFor(weddingId), token);
  window.dispatchEvent(new Event('forevervow:guest-session'));
};
export const getGuestSessionToken = (weddingId: string) => localStorage.getItem(keyFor(weddingId));
export const clearGuestSessionToken = (weddingId: string) => {
  localStorage.removeItem(keyFor(weddingId));
  window.dispatchEvent(new Event('forevervow:guest-session'));
};

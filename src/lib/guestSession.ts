const keyFor = (weddingId: string) => `forevervow-guest-session-${weddingId}`;
export const saveGuestSessionToken = (weddingId: string, token: string) => localStorage.setItem(keyFor(weddingId), token);
export const getGuestSessionToken = (weddingId: string) => localStorage.getItem(keyFor(weddingId));
export const clearGuestSessionToken = (weddingId: string) => localStorage.removeItem(keyFor(weddingId));

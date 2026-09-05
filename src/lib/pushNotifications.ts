export const isPushSupported = () => typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;
export const requestPushPermission = async () => isPushSupported() ? Notification.requestPermission() : "unsupported" as NotificationPermission;
export const getPushSubscription = async () => { if (!isPushSupported()) return null; const registration = await navigator.serviceWorker.ready; return registration.pushManager.getSubscription(); };
export const urlBase64ToUint8Array = (value: string) => {
  const padded = value + "=".repeat((4 - (value.length % 4)) % 4);
  const decoded = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(decoded, (char) => char.charCodeAt(0));
};
export const registerPushSubscription = async (publicKey: string) => { if (!isPushSupported()) return null; const registration = await navigator.serviceWorker.ready; const existing = await registration.pushManager.getSubscription(); if (existing) return existing; return registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(publicKey) }); };

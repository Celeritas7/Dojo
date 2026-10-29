// Service worker registration and the "new version" prompt. A new worker waits until the person taps Reload.
export function registerServiceWorker(onUpdateReady) {
  if (!("serviceWorker" in navigator) || location.protocol === "file:") return;
  let accepted = false;
  // Reload only after the person accepted an update. (The very first install also changes the controller,
  // via clients.claim(), and must not reload the page.)
  navigator.serviceWorker.addEventListener("controllerchange", () => { if (accepted) location.reload(); });
  const offer = worker => onUpdateReady(() => { accepted = true; worker.postMessage("skipWaiting"); });
  navigator.serviceWorker.register("./sw.js").then(reg => {
    if (reg.waiting && navigator.serviceWorker.controller) offer(reg.waiting);
    reg.addEventListener("updatefound", () => {
      const w = reg.installing;
      w && w.addEventListener("statechange", () => { if (w.state === "installed" && navigator.serviceWorker.controller) offer(w); });
    });
    // Check for a new version when the app comes back to the foreground.
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") reg.update().catch(() => {}); });
  }).catch(() => { /* offline or unsupported: the app still works, just without the offline cache */ });
}

// Reminders: show a system notification when allowed, otherwise the caller falls back to an in-app message.
export async function notify(body) {
  if (!("Notification" in window) || Notification.permission !== "granted") return false;
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) await reg.showNotification("Dojo", { body, tag: "dojo-reminder", icon: "icons/icon-192.png" });
    else new Notification("Dojo", { body, tag: "dojo-reminder", icon: "icons/icon-192.png" });
    return true;
  } catch { return false; }
}

import { useEffect, useState } from "react";

/** True once a service worker controls this page: the video's address is answered by it, so the video must not be asked for before. */
export function useServiceWorkerControl(): boolean {
  const [controlled, setControlled] = useState(() => !("serviceWorker" in navigator) || !!navigator.serviceWorker.controller);
  useEffect(() => {
    if (controlled) return;
    const container = navigator.serviceWorker;
    const check = () => { if (container.controller) setControlled(true); };
    container.addEventListener("controllerchange", check);
    void container.ready.then(check);
    check();
    return () => container.removeEventListener("controllerchange", check);
  }, [controlled]);
  return controlled;
}

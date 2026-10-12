export function getCurrentPosition(signal) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(
        Error(
          "Location is unavailable in this browser. Search by city instead.",
        ),
      );
      return;
    }
    if (signal?.aborted) {
      reject(new DOMException("Cancelled", "AbortError"));
      return;
    }
    const abort = () => reject(new DOMException("Cancelled", "AbortError"));
    signal?.addEventListener("abort", abort, { once: true });
    const clean = () => signal?.removeEventListener("abort", abort);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        clean();
        resolve(position.coords);
      },
      (error) => {
        clean();
        const messages = {
          1: "Location permission was denied. Allow it in browser settings or search by city.",
          2: "Your location could not be determined. Search by city instead.",
          3: "Location lookup timed out. Try again or search by city.",
        };
        reject(
          Error(
            messages[error.code] ||
              "Location is unavailable. Search by city instead.",
          ),
        );
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  });
}

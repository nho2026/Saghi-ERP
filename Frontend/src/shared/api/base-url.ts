export const apiBaseUrl =
  import.meta.env.VITE_API_URL ??
  (window.location.protocol === "file:"
    ? "http://192.168.1.90:4000/api"
    : "/api");

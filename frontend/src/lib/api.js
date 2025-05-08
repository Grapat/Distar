export const API =
  import.meta.env.MODE === "development"
    ? "http://localhost:4005"
    : import.meta.env.VITE_API_URL;
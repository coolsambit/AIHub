const base = import.meta.env.VITE_API_BASE_URL || '';

// Dev:  base is empty, Vite proxy forwards /api/* to localhost backend
// Prod: base is the Function App URL (set in GitHub Actions), /api prefix is stripped
export function apiUrl(path) {
  if (!base) return path;
  return `${base}${path.replace(/^\/api/, '')}`;
}

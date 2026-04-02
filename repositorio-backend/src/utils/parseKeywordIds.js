/**
 * Acepta array, JSON string "[1,2]", CSV "1,2,3" o string vacío (sin palabras clave).
 * @param {unknown} value
 * @returns {number[]}
 */
export function parseKeywordIds(value) {
  if (value === undefined || value === null || value === '') {
    return [];
  }
  if (Array.isArray(value)) {
    return value.map((v) => Number(v)).filter((n) => Number.isInteger(n) && n > 0);
  }
  if (typeof value === 'string') {
    const s = value.trim();
    if (!s) return [];
    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed)) {
        return parsed.map((v) => Number(v)).filter((n) => Number.isInteger(n) && n > 0);
      }
    } catch {
      /* CSV o separadores */
    }
    return s
      .split(/[,;\s]+/)
      .map((x) => Number(x.trim()))
      .filter((n) => Number.isInteger(n) && n > 0);
  }
  return [];
}

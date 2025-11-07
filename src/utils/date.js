export function formatISODate(d) {
  if (!d) return '';
  const dt = (d instanceof Date) ? d : new Date(d);
  return dt.toISOString().slice(0, 10);
}

export function parseDate(dateValue: any): number {
  if (!dateValue) return 0;
  if (typeof dateValue.toDate === 'function') {
    return dateValue.toDate().getTime();
  }
  if (dateValue.seconds) {
    return dateValue.seconds * 1000;
  }
  const d = new Date(dateValue);
  if (!isNaN(d.getTime())) {
    return d.getTime();
  }
  return 0;
}

export function calculateFreeDays(dateValue: any): number {
  const start = parseDate(dateValue);
  if (start === 0) return 0;
  
  const now = Date.now();
  const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  return Math.max(0, 7 - diffDays);
}

export function formatDate(dateValue: any): string {
  const start = parseDate(dateValue);
  if (start === 0) return '-';
  return new Date(start).toLocaleDateString();
}

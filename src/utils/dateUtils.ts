/**
 * Smart Thai Date & Time Formatter
 * Handles:
 * - Standard ISO 8601 strings (e.g. "2026-10-06T04:46:29.000Z")
 * - Thai locale strings with BE year (e.g. "6/10/2569 11:46:29")
 * - Erroneously parsed BE years (e.g. year 3112)
 * - Cross-browser compatibility (Safari iOS, Chrome, Firefox, Edge)
 */
export function formatThaiDateTime(dateStr?: string | null): string {
  if (!dateStr || dateStr.trim() === '') return '-';

  const trimmed = dateStr.trim();

  // 1. Try regex matching for DD/MM/YYYY or D/M/YYYY (with BE or CE year)
  const dmyMatch = trimmed.match(
    /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(?:[,\s]+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/
  );
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10);
    let year = parseInt(dmyMatch[3], 10);
    const hour = dmyMatch[4] ? dmyMatch[4].padStart(2, '0') : '00';
    const minute = dmyMatch[5] ? dmyMatch[5].padStart(2, '0') : '00';

    if (year < 2400) {
      year += 543; // convert CE to BE
    }

    const thaiMonths = [
      '',
      'ม.ค.',
      'ก.พ.',
      'มี.ค.',
      'เม.ย.',
      'พ.ค.',
      'มิ.ย.',
      'ก.ค.',
      'ส.ค.',
      'ก.ย.',
      'ต.ค.',
      'พ.ย.',
      'ธ.ค.',
    ];
    const monthName = thaiMonths[month] || `${month}`;
    return `${day} ${monthName} ${year}, ${hour}:${minute} น.`;
  }

  // 2. Try parsing with standard Date (ISO string or standard date)
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    try {
      const formatted = parsed.toLocaleString('th-TH', {
        timeZone: 'Asia/Bangkok',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

      // If browser added 543 to an already-Buddhist year (e.g. > 3000), correct it
      const yearMatch = formatted.match(/\b(\d{4})\b/);
      if (yearMatch && parseInt(yearMatch[1], 10) > 3000) {
        const wrongYear = parseInt(yearMatch[1], 10);
        const correctYear = wrongYear - 543;
        const fixedFormatted = formatted.replace(yearMatch[1], String(correctYear));
        return `${fixedFormatted} น.`;
      }

      return `${formatted} น.`;
    } catch {
      return parsed.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
  }

  return trimmed;
}

export function formatThaiDateOnly(dateStr?: string | null): string {
  if (!dateStr) return '-';
  const full = formatThaiDateTime(dateStr);
  return full.split(',')[0] || full;
}

/**
 * Safely parse date strings into epoch millisecond timestamp for sorting
 */
export function parseDateTimestamp(dateStr?: string | null): number {
  if (!dateStr || dateStr.trim() === '') return 0;

  const trimmed = dateStr.trim();
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    const year = d.getFullYear();
    if (year > 3000) {
      d.setFullYear(year - 1086);
    } else if (year > 2500) {
      d.setFullYear(year - 543);
    }
    return d.getTime();
  }

  const parts = trimmed.match(
    /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(?:[,\s]+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/
  );
  if (parts) {
    const day = parseInt(parts[1], 10);
    const month = parseInt(parts[2], 10) - 1;
    let year = parseInt(parts[3], 10);
    if (year > 2400) year -= 543; // convert BE to CE
    const hour = parts[4] ? parseInt(parts[4], 10) : 0;
    const minute = parts[5] ? parseInt(parts[5], 10) : 0;
    const second = parts[6] ? parseInt(parts[6], 10) : 0;
    const parsedDate = new Date(year, month, day, hour, minute, second);
    return isNaN(parsedDate.getTime()) ? 0 : parsedDate.getTime();
  }

  return 0;
}


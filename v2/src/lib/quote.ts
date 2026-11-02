export interface QuoteForm {
  event: string;
  date: string;
  guests: string;
  name: string;
  message: string;
}

const MAX_MESSAGE_LENGTH = 1500;

export function daysUntil(isoDate: string, today: Date = new Date()): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return null;
  const [year, month, day] = isoDate.split('-').map(Number);
  const target = Date.UTC(year, month - 1, day);
  const base = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const diff = Math.round((target - base) / 86_400_000);
  return Number.isFinite(diff) ? diff : null;
}

export function buildQuoteMessage(template: string, form: QuoteForm): string {
  const values: Record<keyof QuoteForm, string> = {
    event: form.event.trim(),
    date: form.date.trim(),
    guests: form.guests.trim(),
    name: form.name.trim(),
    message: form.message.trim(),
  };
  const lines = template.split('\n').filter((line) => {
    const used = [...line.matchAll(/\{(\w+)\}/g)].map((match) => match[1] as keyof QuoteForm);
    return used.every((key) => values[key] !== '');
  });
  const text = lines.join('\n').replace(/\{(\w+)\}/g, (_, key: keyof QuoteForm) => values[key] ?? '');
  return text.length > MAX_MESSAGE_LENGTH ? `${text.slice(0, MAX_MESSAGE_LENGTH - 1)}…` : text;
}

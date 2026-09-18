export type Priority = "low" | "medium" | "high";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function parseDateKey(value?: string | null) {
  if (!value) return null;

  const dateOnly = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (dateOnly) {
    const [, year, month, day] = dateOnly;
    return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function utcDayStart(date: Date) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export function getAutomaticPriority(
  dueDate?: string | null,
  fallback: Priority = "medium"
): Priority {
  const parsedDueDate = parseDateKey(dueDate);
  if (!parsedDueDate) return fallback;

  const today = new Date();
  const daysUntilDue = Math.ceil(
    (utcDayStart(parsedDueDate) -
      Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())) /
      MS_PER_DAY
  );

  if (daysUntilDue <= 1) return "high";
  if (daysUntilDue <= 3) return "medium";
  return "low";
}

export function hospitalDate(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (key) => parts.find((part) => part.type === key).value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}
export function todayWindow(now, timeZone) {
  const date = hospitalDate(now, timeZone);
  const midnight = new Date(`${date}T00:00:00Z`).getTime();
  // Cover every UTC offset; the service then applies the exact hospital date.
  return {
    date,
    start: new Date(midnight - 14 * 3600000),
    end: new Date(midnight + 38 * 3600000),
  };
}

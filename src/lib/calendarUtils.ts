/**
 * Shared calendar utility for generating .ics files.
 */
export const generateICS = (
  coupleNames: string,
  weddingDate: string,
  ceremonyTime: string | null,
  venue: string,
  siteUrl: string
) => {
  const dt = new Date(weddingDate);
  if (ceremonyTime) {
    const [h, m] = ceremonyTime.match(/(\d+):(\d+)/)?.slice(1).map(Number) || [14, 0];
    const isPM = ceremonyTime.toLowerCase().includes("pm");
    dt.setHours(isPM && h !== 12 ? h + 12 : !isPM && h === 12 ? 0 : h, m);
  } else {
    dt.setHours(14, 0);
  }
  const end = new Date(dt.getTime() + 4 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Wedding//EN",
    "BEGIN:VEVENT",
    `DTSTART:${fmt(dt)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:Wedding of ${coupleNames}`,
    `LOCATION:${venue}`,
    `DESCRIPTION:We look forward to celebrating with you.\\n${siteUrl}`,
    `URL:${siteUrl}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${coupleNames.replace(/\s+/g, "-").toLowerCase()}-wedding.ics`;
  a.click();
  URL.revokeObjectURL(a.href);
};

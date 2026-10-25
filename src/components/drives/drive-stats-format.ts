const UNITS = ["B", "KB", "MB", "GB", "TB"];

/** A size for a drive card: "0 B", "12 KB", "1.5 GB" (one decimal below ten, none above, so the card stays narrow). */
export function formatBytes(bytes: number): string {
    if (!(bytes > 0)) return "0 B";
    let value = bytes;
    let unit = 0;
    while (value >= 1024 && unit < UNITS.length - 1) {
        value /= 1024;
        unit++;
    }
    const digits = unit === 0 || value >= 10 ? 0 : 1;
    return `${value.toFixed(digits).replace(/\.0$/, "")} ${UNITS[unit]}`; // "3 GB", not "3.0 GB"
}

/** "Dec 12, 2024, 12:32" in the user's own language and time zone. */
export function formatDateTime(milliseconds: number): string {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(milliseconds));
}

/**
 * When something happened, short and in the user's language and time zone: "12 min ago", "2 h ago", "Today, 10:05", "Yesterday, 18:40", "Oct 18, 09:12"
 * (with the year when it is another one). `now` is the moment to measure from.
 */
export function formatWhen(milliseconds: number, now: number = Date.now()): string {
    const minutes = Math.floor((now - milliseconds) / 60_000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes} min ago`;
    if (minutes < 6 * 60) return `${Math.floor(minutes / 60)} h ago`;
    const when = new Date(milliseconds);
    const today = new Date(now);
    const time = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(when);
    const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    if (sameDay(when, today)) return `Today, ${time}`;
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (sameDay(when, yesterday)) return `Yesterday, ${time}`;
    const date = new Intl.DateTimeFormat(undefined, when.getFullYear() === today.getFullYear() ? { month: "short", day: "numeric" } : { month: "short", day: "numeric", year: "numeric" }).format(when);
    return `${date}, ${time}`;
}

/**
 * How long ago, in a few words: "just now", "12 min ago", "3 h ago", "Today", "Yesterday", "4 days ago", then a date ("Oct 18", with the year when it
 * is another one). `now` is the moment to measure from.
 */
export function formatAgo(milliseconds: number, now: number = Date.now()): string {
    const minutes = Math.floor((now - milliseconds) / 60_000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes} min ago`;
    if (minutes < 6 * 60) return `${Math.floor(minutes / 60)} h ago`;
    const startOfDay = (time: number) => { const d = new Date(time); return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); };
    const days = Math.round((startOfDay(now) - startOfDay(milliseconds)) / 86_400_000);
    if (days <= 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    const when = new Date(milliseconds);
    const sameYear = when.getFullYear() === new Date(now).getFullYear();
    return new Intl.DateTimeFormat(undefined, sameYear ? { month: "short", day: "numeric" } : { month: "short", day: "numeric", year: "numeric" }).format(when);
}

/** The share of the stored bytes that live files take, 0-100, or undefined when either is not known. */
export function usedPercent(usedBytes: number | undefined, storedBytes: number | null): number | undefined {
    if (usedBytes === undefined || storedBytes == null || !(storedBytes > 0)) return undefined;
    return Math.max(0, Math.min(100, Math.round((usedBytes / storedBytes) * 100)));
}

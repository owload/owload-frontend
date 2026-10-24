import type { DriveInfo } from "@/engine";

/** "You, Maria Lopez, Daniel Kim and 2 more": the first three by name, the rest counted. */
export function peopleLine(names: string[], total: number): string {
    const shown = names.slice(0, 3);
    const more = total - shown.length;
    if (more <= 0) return shown.length > 1 ? `${shown.slice(0, -1).join(", ")} and ${shown[shown.length - 1]}` : shown.join("");
    return `${shown.join(", ")} and ${more} more`;
}

/** "1 admin · 2 writers · 1 reader": the roles of the others, in the order of their rank. */
export function rolesLine(roles: DriveInfo["accessRoles"]): string {
    const parts: string[] = [];
    for (const [role, label] of [["admin", "admin"], ["writer", "writer"], ["reader", "reader"]] as const) {
        const count = roles[role] ?? 0;
        if (count > 0) parts.push(`${count} ${label}${count === 1 ? "" : "s"}`);
    }
    return parts.join(" · ");
}

/** The stretches of time that the reads of a drive are grouped by, newest first. */
export type ReadSegment = "hour" | "today" | "yesterday" | "week" | "earlier";

export const READ_SEGMENT_LABEL: Record<ReadSegment, string> = {
    hour: "Last hour",
    today: "Today",
    yesterday: "Yesterday",
    week: "This week",
    earlier: "Earlier",
};

/** Which stretch of time a moment belongs to, as seen from `now`: no more than an hour ago, later today, yesterday, in the last seven days, before that. */
export function readSegmentOf(at: number, now: number): ReadSegment {
    if (now - at < 3_600_000) return "hour";
    const when = new Date(at);
    const today = new Date(now);
    const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const days = Math.round((startOfDay(today) - startOfDay(when)) / 86_400_000);
    if (days <= 0) return "today";
    if (days === 1) return "yesterday";
    if (days < 7) return "week";
    return "earlier";
}

/** Which of `count` fills a person's face has: the same for the same person wherever the face is drawn (a hash of their id, not their place in a list). */
export function faceFill(id: string, count: number): number {
    let hash = 2166136261;
    for (let i = 0; i < id.length; i++) {
        hash ^= id.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    hash ^= hash >>> 15;
    return (hash >>> 0) % Math.max(1, count);
}

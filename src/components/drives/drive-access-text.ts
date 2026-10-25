import type { DriveInfo } from "@/engine";

/** "1 admin · 2 writers · 1 reader": the roles of the others, in the order of their rank. */
export function rolesLine(roles: DriveInfo["accessRoles"]): string {
    const parts: string[] = [];
    for (const [role, label] of [["admin", "admin"], ["writer", "writer"], ["reader", "reader"]] as const) {
        const count = roles[role] ?? 0;
        if (count > 0) parts.push(`${count} ${label}${count === 1 ? "" : "s"}`);
    }
    return parts.join(" · ");
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

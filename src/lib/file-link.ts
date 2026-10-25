/**
 * The link to one file or folder of a public drive: the link of the drive with the id of the item after a `#`
 * (`https://app.example/p/<token>#<id>`). The part after `#` is never sent to a server, so nothing but the drive's own link reaches one.
 */
export function fileLink(driveLink: string, nodeId: string): string {
    return `${driveLink.split("#")[0]}#${encodeURIComponent(nodeId)}`;
}

/** The id of the item that a link points at (the part after `#`), or undefined for a link to the drive itself. */
export function nodeIdOfLinkHash(hash: string): string | undefined {
    const raw = hash.startsWith("#") ? hash.slice(1) : hash;
    if (!raw) return undefined;
    try {
        return decodeURIComponent(raw) || undefined;
    } catch {
        return undefined;
    }
}

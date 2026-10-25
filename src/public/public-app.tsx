import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { createJSONStorage } from "zustand/middleware";
import { SidebarProvider } from "@/components/ui/sidebar";
import { FsOpsDialog } from "@/components/fs-dialogs/fs-ops-dialog";
import { DriveExplorerArea } from "@/components/files-area/drive-explore-area";
import { DriveExplorerPage } from "@/pages/drive-explorer-page";
import { getPublicDriveInfo, type PublicDriveInfo } from "@/engine/backend/access-backend";
import type { DriveInfo } from "@/engine";
import { hasSignedInHere, returnAfterSignIn } from "@/auth-context-provider";
import { nodeIdOfLinkHash } from "@/lib/file-link";
import { useFilesStore } from "@/stores/files-store";

const STORAGE_KEY = "owload_public_drive";

/** The link of the public drive that this tab has open, kept for the tab only, so that a reload of the page of the drive works. */
function rememberedDrive(): { token: string, driveId: string } | undefined {
    try {
        const value = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "null");
        return value && typeof value.token === "string" && typeof value.driveId === "string" ? value : undefined;
    } catch {
        return undefined;
    }
}

/** The tab leaves the public drive for the main app (or the link turned out not to work any more): a reload of a page of the drive is then the main app's. */
function forgetRememberedDrive() {
    try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* storage may be blocked */ }
}

/** The token in a link `/p/<token>`, or that of the public drive this tab already has open (when the page of its drive is reloaded). */
export function publicTokenOfThisPage(): string | undefined {
    const fromLink = /^\/p\/([A-Za-z0-9_-]+)/.exec(window.location.pathname)?.[1];
    if (fromLink) return fromLink;
    const remembered = rememberedDrive();
    return remembered && window.location.pathname.startsWith(`/drive/${remembered.driveId}`) ? remembered.token : undefined;
}

function asDriveInfo(info: PublicDriveInfo): DriveInfo {
    return {
        id: info.id,
        ownerUserId: "",
        title: info.title,
        ACL: {},
        createdTimestamp: info.createdTimestamp,
        keyNonce: info.keyNonce,
        counterNonce: info.counterNonce,
        visibility: "public",
        myRole: "reader",
        peopleCount: 0,
        ownerName: info.ownerName,
        ownerEmail: null,
        lastReadAt: info.lastReadAt ?? null,
        storedBytes: null,
        storageLimitBytes: null,
        accessPeople: [],
        accessTotal: 1,
        accessRoles: {},
        publicLink: null,
        recentReads: [],
    };
}

function PublicLayout({ linkedNodeId }: { linkedNodeId?: string }) {
    const token = useFilesStore((state) => state.publicToken);
    const signedIn = hasSignedInHere();
    const title = useFilesStore((state) => state.drives[0]?.title);
    const owner = useFilesStore((state) => state.drives[0]?.ownerName);
    return (
        <SidebarProvider className="block">
            <div className="relative h-svh w-full">
                <header className="absolute inset-x-0 top-0 z-25 flex h-[73px] items-center gap-3 border-b border-border bg-background px-[clamp(16px,2.2vw,28px)]">
                    <a href="https://owload.com" rel="noopener noreferrer" aria-label="Owload home" className="flex min-h-11 items-center">
                        <img src="/logo-full.svg" alt="" className="h-8 w-auto" />
                    </a>
                    <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-[15px] font-semibold">{title}</span>
                        <span className="truncate text-xs text-muted-foreground">Public drive{owner ? ` of ${owner}` : ""}</span>
                    </div>
                    {/* a page load, not a route (the router of this app sends every other address back to the drive) */}
                    {signedIn ? (
                        <a href="/" onClick={forgetRememberedDrive} className="flex h-11 flex-none items-center rounded-[10px] border border-sunny-ink px-4 text-sm font-semibold hover:bg-secondary">My drives</a>
                    ) : (
                        // the main app goes on to the sign-in page, and after it comes back to the link this page was opened with
                        <a
                            href="/?signin=1"
                            onClick={() => { forgetRememberedDrive(); if (token) returnAfterSignIn(`/p/${token}${linkedNodeId ? `#${encodeURIComponent(linkedNodeId)}` : ""}`); }}
                            className="flex h-11 flex-none items-center rounded-[10px] border border-sunny-ink px-4 text-sm font-semibold hover:bg-secondary"
                        >Sign in</a>
                    )}
                </header>
                <Outlet />
            </div>
            <FsOpsDialog />
        </SidebarProvider>
    );
}

function Message({ title, text }: { title: string, text: string }) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-3 px-6 text-center">
            <img src="/logo-full.svg" alt="Owload" className="h-9 w-auto" />
            <h1 className="m-0 text-2xl font-semibold">{title}</h1>
            <p className="m-0 max-w-md text-sm text-muted-foreground">{text}</p>
            <a href="https://owload.com" rel="noopener noreferrer" className="text-sm font-semibold underline underline-offset-4">owload.com</a>
        </div>
    );
}

function Routing({ driveId, linkedNodeId }: { driveId: string, linkedNodeId?: string }) {
    const location = useLocation();
    const navigate = useNavigate();
    // The link `/p/<token>` goes on to the drive itself, whose password the page then asks for; a link to a file or folder
    // (`/p/<token>#<id>`) goes on to it, and it opens once the drive does.
    useEffect(() => {
        if (location.pathname.startsWith("/p/")) navigate(linkedNodeId ? `/drive/${driveId}/${encodeURIComponent(linkedNodeId)}` : `/drive/${driveId}`, { replace: true });
    }, [driveId, linkedNodeId, location.pathname, navigate]);
    return (
        <Routes>
            <Route element={<PublicLayout linkedNodeId={linkedNodeId} />}>
                <Route path="/drive/:driveId" element={<DriveExplorerPage />}>
                    <Route path="/drive/:driveId/:dirId?" element={<DriveExplorerArea />} />
                </Route>
            </Route>
            <Route path="/p/*" element={null} />
            <Route path="*" element={<Navigate to={`/drive/${driveId}`} replace />} />
        </Routes>
    );
}

/**
 * The app for someone who opens the link of a public drive: no sign-in, no sidebar, the drive read-only. The password of the drive is
 * asked by the same dialog as for a signed-in user. Nothing is kept in the browser beyond this tab (the keys go to the session storage).
 */
export function PublicApp({ token }: { token: string }) {
    const [state, setState] = useState<"loading" | "ready" | "missing" | "failed">("loading");
    const [driveId, setDriveId] = useState("");
    // read once, before the router replaces the address: the part after `#` is the file or folder the link is for
    const [linkedNodeId] = useState(() => (window.location.pathname.startsWith("/p/") ? nodeIdOfLinkHash(window.location.hash) : undefined));

    useEffect(() => {
        // The link is a secret: do not pass it on in the Referer of a link followed from here, and keep search engines out.
        const metas = [["referrer", "no-referrer"], ["robots", "noindex, nofollow"]].map(([name, content]) => {
            const meta = document.createElement("meta");
            meta.name = name;
            meta.content = content;
            document.head.appendChild(meta);
            return meta;
        });
        useFilesStore.persist.setOptions({ name: "owload_fstorage_public", storage: createJSONStorage(() => sessionStorage) });
        useFilesStore.setState({ driveKeys: {}, driveStats: {} });
        let cancelled = false;
        getPublicDriveInfo(token)
            .then((info) => {
                if (cancelled) return;
                useFilesStore.getState().openPublicDrive(asDriveInfo(info), token);
                sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ token, driveId: info.id }));
                setDriveId(info.id);
                setState("ready");
            })
            .catch((error) => {
                if (cancelled) return;
                const missing = (error as { response?: { status?: number } })?.response?.status === 404;
                if (missing && !window.location.pathname.startsWith("/p/")) {
                    // a reload of the drive's own page, whose remembered link has been replaced or turned off: not a public page any more
                    forgetRememberedDrive();
                    window.location.reload();
                    return;
                }
                setState(missing ? "missing" : "failed");
            });
        return () => { cancelled = true; metas.forEach((meta) => meta.remove()); };
    }, [token]);

    if (state === "loading") return null;
    if (state === "missing") return <Message title="This link does not work" text="The drive may have been made private, or its link replaced. Ask the person who shared it for a new link." />;
    if (state === "failed") return <Message title="The drive could not be opened" text="Something went wrong on the way. Try again in a moment." />;
    return <BrowserRouter><Routing driveId={driveId} linkedNodeId={linkedNodeId} /></BrowserRouter>;
}

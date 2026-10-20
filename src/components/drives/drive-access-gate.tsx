import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Ban, Check, Clock, Send } from "lucide-react";
import { useLogout, useUserInfo } from "@/auth-context-provider";
import { ACCESS_MESSAGE_MAX, RestAccessBackend, type MyAccessRequest } from "@/engine/backend/access-backend";
import { useSkeletonGate } from "@/hooks/use-skeleton-gate";
import { useFilesStore } from "@/stores/files-store";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/profile/user-avatar";
import { cn } from "@/lib/utils";
import { formatDateTime } from "./drive-stats-format";
import { DriveNotFound } from "./drive-not-found";

const backend = new RestAccessBackend();

const BUTTON = "flex h-11 cursor-pointer items-center justify-center gap-2 rounded-[10px] px-5 text-sm font-semibold outline-sunny-ink focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-default disabled:opacity-50";

function statusOf(error: unknown): number | undefined {
    return (error as { response?: { status?: number } })?.response?.status;
}

function errorText(error: unknown): string {
    if (statusOf(error) === 429) return "You have asked for access too many times. Try again in an hour.";
    if (statusOf(error) === 409) return "You already have access to this drive.";
    const detail = (error as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail;
    return typeof detail === "string" ? detail : "That did not work. Try again.";
}

/**
 * What a drive's address shows when the drive is not in the user's list (owload-docs/decisions/0037): that there is no such drive, or that
 * the drive exists and the user may ask its admins for access, or that they have asked. Once the user is on the drive (an admin answered)
 * the list is loaded again and the drive opens.
 */
export function DriveAccessGate({ driveId }: { driveId: string | undefined }) {
    const updateDrives = useFilesStore((state) => state.updateDrives);
    const [request, setRequest] = useState<MyAccessRequest | undefined>();
    const [missing, setMissing] = useState(false);
    const [failed, setFailed] = useState(false);
    const loading = !request && !missing && !failed;
    const gate = useSkeletonGate(loading);

    const load = useCallback(async () => {
        if (!driveId) { setMissing(true); return; }
        setFailed(false);
        try {
            setRequest(await backend.getMyAccessRequest(driveId));
        } catch (error) {
            if (statusOf(error) === 404) setMissing(true);
            else setFailed(true);
        }
    }, [driveId]);

    useEffect(() => { setRequest(undefined); setMissing(false); void load(); }, [load]);
    // the person is on the drive now (an admin let them in): the list of drives has it, and the page opens it
    useEffect(() => { if (request?.hasAccess) void updateDrives(); }, [request?.hasAccess, updateDrives]);

    if (missing) return <DriveNotFound />;

    return (
        <div className="absolute inset-x-0 bottom-0 top-18 flex flex-col gap-6 overflow-y-auto px-4 pb-10 pt-6 md:px-10">
            {failed ? (
                <div className="flex flex-col items-start gap-3">
                    <p role="alert" className="m-0 text-sm text-[#b3261e]">The drive could not be checked. Try again.</p>
                    <button type="button" onClick={() => void load()} className={cn(BUTTON, "border border-sunny-ink bg-white text-sunny-ink hover:bg-sunny-field")}>Try again</button>
                </div>
            ) : !request || request.hasAccess ? (
                gate === "skeleton"
                    ? <Skeleton className="h-[260px] w-full max-w-[560px] self-center rounded-2xl" />
                    : <div aria-hidden="true" className="invisible h-[260px]" />
            ) : (
                <NoAccess request={request} onChanged={setRequest} onCancelled={load} />
            )}
        </div>
    );
}

function NoAccess({ request, onChanged, onCancelled }: { request: MyAccessRequest, onChanged: (request: MyAccessRequest) => void, onCancelled: () => Promise<void> }) {
    const user = useUserInfo();
    const logout = useLogout();
    const [message, setMessage] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | undefined>();
    const asked = request.requested;
    const StatusIcon = asked ? Clock : Ban;

    async function run(action: () => Promise<void>) {
        setBusy(true);
        setError(undefined);
        try { await action(); } catch (e) { setError(errorText(e)); } finally { setBusy(false); }
    }

    return (
        <>
            <div className="flex flex-col gap-1">
                <h1 className="m-0 break-words text-2xl font-semibold leading-tight tracking-[-0.01em] text-sunny-ink">{request.title}</h1>
                <p className="m-0 flex items-center gap-1.5 text-[13px] font-semibold text-[#3b3a34]">
                    <StatusIcon aria-hidden="true" className="size-3.5" strokeWidth={2.2} />
                    <span>{asked ? "Access requested" : "No access"}</span>
                </p>
            </div>

            <div className="flex flex-1 items-center justify-center pb-16 max-md:pb-0">
                <section
                    role={asked ? "status" : undefined}
                    aria-labelledby="drive-access-title"
                    className="flex w-full max-w-[560px] flex-col gap-[18px] rounded-2xl border border-sunny-line bg-white p-7 shadow-[0_6px_18px_rgba(0,0,0,0.06)] max-md:p-5"
                >
                    <div className="flex items-start gap-3.5">
                        <span aria-hidden="true" className={cn("flex size-11 flex-none items-center justify-center rounded-xl", asked ? "bg-[#e6f3eb] text-[#1e7b45]" : "bg-sunny-field text-sunny-ink")}>
                            {asked ? <Check className="size-[22px]" strokeWidth={2} /> : <Ban className="size-[22px]" strokeWidth={2} />}
                        </span>
                        <div className="flex min-w-0 flex-col gap-1">
                            <h2 id="drive-access-title" className="m-0 text-[22px] font-semibold leading-tight">{asked ? "Request sent" : "You don’t have access to this drive"}</h2>
                            <p className="m-0 text-sunny-muted">
                                {asked
                                    ? "You’ll get an email when an admin answers. The drive then shows up in My drives."
                                    : "Ask for access. The drive’s admins get your request by email and choose your role."}
                            </p>
                        </div>
                    </div>

                    {asked ? (
                        <>
                            <dl className="m-0 flex flex-col gap-2 rounded-xl border border-sunny-line p-3.5 text-[13px]">
                                <div className="flex justify-between gap-3"><dt className="text-sunny-muted">Requested</dt><dd className="m-0 font-semibold">{request.requestedAt ? formatDateTime(new Date(request.requestedAt).getTime()) : "—"}</dd></div>
                                <div className="flex justify-between gap-3"><dt className="text-sunny-muted">From</dt><dd className="m-0 break-all text-right font-semibold">{user.email}</dd></div>
                                {request.message && (
                                    <div className="flex flex-col gap-1 border-t border-sunny-line pt-2">
                                        <dt className="text-sunny-muted">Your message</dt>
                                        <dd className="m-0 whitespace-pre-wrap break-words leading-normal">{request.message}</dd>
                                    </div>
                                )}
                            </dl>
                            {error && <p role="alert" className="m-0 text-sm font-semibold text-[#b3261e]">{error}</p>}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                <Link to="/" className={cn(BUTTON, "bg-sunny-yellow text-sunny-ink hover:bg-sunny-yellow-edge")}>Back to My drives</Link>
                                <button
                                    type="button"
                                    disabled={busy}
                                    onClick={() => void run(async () => { await backend.cancelAccessRequest(request.driveId); await onCancelled(); })}
                                    className="h-11 cursor-pointer px-1.5 text-sm font-semibold text-sunny-ink underline underline-offset-4 outline-sunny-ink focus-visible:outline-2 disabled:cursor-default disabled:opacity-50"
                                >
                                    Cancel request
                                </button>
                            </div>
                        </>
                    ) : (
                        <form
                            className="m-0 flex flex-col gap-4"
                            onSubmit={(e) => { e.preventDefault(); void run(async () => onChanged(await backend.requestAccess(request.driveId, message))); }}
                        >
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="drive-access-message" className="text-[13px] font-semibold">Message <span className="font-normal text-sunny-muted">(optional)</span></label>
                                <textarea
                                    id="drive-access-message"
                                    rows={3}
                                    maxLength={ACCESS_MESSAGE_MAX}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Why you need access"
                                    className="min-h-[84px] w-full resize-y rounded-[10px] border border-[#8f8d84] bg-white px-3 py-2.5 text-sm leading-normal text-sunny-ink outline-sunny-ink focus-visible:outline-2 focus-visible:outline-offset-2"
                                />
                                <p className="m-0 text-xs text-sunny-muted">The admins read it in an email, as plain text. Do not put the drive’s password or other secrets in it.</p>
                            </div>
                            {error && <p role="alert" className="m-0 text-sm font-semibold text-[#b3261e]">{error}</p>}
                            <div className="flex flex-wrap gap-2">
                                <button type="submit" disabled={busy} className={cn(BUTTON, "bg-sunny-yellow text-sunny-ink hover:bg-sunny-yellow-edge max-md:min-w-[150px] max-md:flex-1")}>
                                    <Send aria-hidden="true" className="size-4" strokeWidth={2.2} />
                                    <span>{busy ? "Sending…" : "Request access"}</span>
                                </button>
                                <Link to="/" className={cn(BUTTON, "border border-sunny-ink bg-white text-sunny-ink hover:bg-sunny-field max-md:min-w-[150px] max-md:flex-1")}>Back to My drives</Link>
                            </div>
                        </form>
                    )}

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl bg-sunny-field px-3.5 py-3">
                        <UserAvatar className="size-7" />
                        <span className="min-w-0 flex-[1_1_160px] text-[13px] text-[#3b3a34]">Signed in as <b className="break-all font-semibold text-sunny-ink">{user.email}</b></span>
                        <button type="button" onClick={logout} className="flex min-h-8 cursor-pointer items-center text-sm font-semibold text-sunny-ink underline underline-offset-4 outline-sunny-ink focus-visible:outline-2">Switch account</button>
                    </div>
                </section>
            </div>
        </>
    );
}

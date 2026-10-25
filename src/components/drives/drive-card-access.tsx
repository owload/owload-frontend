import { useState } from "react";
import { Check, Copy, Globe, UserRound } from "lucide-react";
import type { DriveInfo, DriveRecentRead } from "@/engine";
import { initialsOf } from "@/components/profile/avatar-presets";
import { UserAvatar } from "@/components/profile/user-avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { faceFill, rolesLine } from "./drive-access-text";
import { formatAgo, formatWhen } from "./drive-stats-format";

/** The faces of the others take these fills, each person always the same one (by their id), so that they are told apart and none is yellow, which the open card is. */
const FILLS = ["bg-white text-sunny-ink", "bg-sunny-ink text-sunny-yellow", "bg-[#e9e8e3] text-sunny-ink", "bg-[#3a372f] text-white"];
/** On the yellow card of an open drive every face has a faint dark edge, the person's own included. */
const EDGE_ON_YELLOW = "outline outline-1 outline-sunny-ink/35";
const FACES_SHOWN = 4;

function Initials({ name, id, size, open }: { name: string, id: string, size: "sm" | "md", open: boolean }) {
    return (
        <span
            aria-hidden="true"
            className={cn(
                "flex flex-none items-center justify-center rounded-full font-semibold shadow-[inset_0_0_0_1px_rgba(29,28,25,0.14)]",
                open ? `ring-2 ring-sunny-yellow-surface ${EDGE_ON_YELLOW}` : "ring-2 ring-white",
                size === "md" ? "size-7 text-[10px]" : "size-6 text-[9px]",
                FILLS[faceFill(id, FILLS.length)],
            )}
        >
            {initialsOf(name)}
        </span>
    );
}

/** A visitor of the public link who did not sign in: no initials, no colour of their own, only that someone came. */
function VisitorFace({ size, open }: { size: "sm" | "md", open: boolean }) {
    return (
        <span
            aria-hidden="true"
            className={cn(
                "flex flex-none items-center justify-center rounded-full bg-[#e9e8e3] text-sunny-ink shadow-[inset_0_0_0_1px_rgba(29,28,25,0.14)]",
                open ? `ring-2 ring-sunny-yellow-surface ${EDGE_ON_YELLOW}` : "ring-2 ring-white",
                size === "md" ? "size-7" : "size-6",
            )}
        >
            <UserRound className="size-3.5" strokeWidth={2} />
        </span>
    );
}

function MyFace({ open, size }: { open: boolean, size: "sm" | "md" }) {
    return <UserAvatar className={cn("ring-2", size === "md" ? "size-7" : "size-6", open ? `ring-sunny-yellow-surface ${EDGE_ON_YELLOW}` : "ring-white")} />;
}

/** A face that says who it is when the pointer rests on it or it is focused: the name, and under it what else is known (the role, when they read). */
function Who({ name, detail, children }: { name: string, detail?: string, children: React.ReactNode }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span tabIndex={0} aria-label={detail ? `${name}, ${detail}` : name} className="flex rounded-full outline-sunny-ink focus-visible:outline-2">{children}</span>
            </TooltipTrigger>
            <TooltipContent side="top" className="flex flex-col items-start gap-0.5 bg-sunny-ink text-white">
                <span className="font-semibold">{name}</span>
                {detail && <span className="text-[11px] text-white/75">{detail}</span>}
            </TooltipContent>
        </Tooltip>
    );
}

const capital = (word: string) => `${word[0].toUpperCase()}${word.slice(1)}`;

/** What the hover says about a reader besides the name: the role (or the browser of a visitor), what they did and when. */
function readDetail(read: DriveRecentRead, mine: boolean): string {
    const what = `${read.kind === "opened" ? "Opened the drive" : "Read files"} ${formatWhen(read.at)}`;
    if (read.role === "visitor") return `Not signed in${read.device ? ` · ${read.device}` : ""} · ${what}`;
    return `${mine ? "" : `${capital(read.role)} · `}${what}`;
}

/**
 * The quiet line under a card (owload-docs/decisions/0039): who can open the drive and who read it last, on one grey line. Who is on it: only you,
 * anyone with the link, or the faces of the people and how many; who read it: the newest reader by name and how long ago, the rest on the faces' hover.
 */
export function InfoLine({ driveInfo, open, onAll }: { driveInfo: DriveInfo, open: boolean, onAll: () => void }) {
    const [copied, setCopied] = useState(false);
    const muted = open ? "text-sunny-text-on-yellow" : "text-sunny-muted";
    const myId = driveInfo.accessPeople.find((person) => person.isMe)?.id;
    const reads = [...driveInfo.recentReads].sort((a, b) => b.at - a.at);
    const newest = reads[0];
    const alone = driveInfo.accessTotal <= 1 && driveInfo.visibility !== "public";
    const owner = driveInfo.myRole !== "owner" ? (driveInfo.ownerName || driveInfo.ownerEmail) : undefined;
    const peopleTitle = [owner ? `Owner: ${owner}` : "", rolesLine(driveInfo.accessRoles)].filter(Boolean).join(" · ") || undefined;

    async function copy() {
        if (!driveInfo.publicLink) return;
        try {
            await navigator.clipboard.writeText(driveInfo.publicLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch { /* nothing to copy to: the link is in the drive's settings */ }
    }

    return (
        <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-2 rounded-b-[15px] px-[18px] py-2.5 text-[13px]", open ? "bg-sunny-ink/[0.08]" : "bg-sunny-ink/[0.035]")}>
            {driveInfo.visibility === "public" && (
                <span className="flex items-center gap-2.5 max-md:order-1">
                    <span aria-hidden="true" className={cn("flex size-7 flex-none items-center justify-center rounded-full", open ? "bg-white/60" : "bg-white")}><Globe className="size-3.5" strokeWidth={2} /></span>
                    <b className="font-semibold">Anyone with the link</b>
                    {driveInfo.publicLink && (
                        <button type="button" onClick={(event) => { event.stopPropagation(); void copy(); }} className={cn("flex min-h-7 cursor-pointer items-center gap-1.5 text-xs font-semibold underline underline-offset-[3px] outline-sunny-ink focus-visible:outline-2", muted)}>
                            {copied ? <Check aria-hidden="true" className="size-3.5" strokeWidth={2.4} /> : <Copy aria-hidden="true" className="size-3.5" strokeWidth={2} />}
                            <span>{copied ? "Copied" : "Copy link"}</span>
                        </button>
                    )}
                </span>
            )}

            {alone ? (
                <span className="flex items-center gap-2.5 max-md:order-1" title="Nobody else can read this drive">
                    <MyFace open={open} size="md" />
                    <b className="font-semibold">Only you</b>
                </span>
            ) : driveInfo.accessTotal > 1 && (
                <span className="flex items-center gap-2.5 max-md:order-1" title={peopleTitle}>
                    <span className="flex flex-none pl-1">
                        {driveInfo.accessPeople.slice(0, FACES_SHOWN).map((person) => (
                            <span key={person.id} className="-ml-1">
                                <Who name={person.isMe ? "You" : person.name} detail={capital(person.role)}>
                                    {person.isMe ? <MyFace open={open} size="md" /> : <Initials name={person.name} id={person.id} size="md" open={open} />}
                                </Who>
                            </span>
                        ))}
                    </span>
                    <b className="font-semibold">{driveInfo.accessTotal} people</b>
                </span>
            )}

            <span aria-hidden="true" className={cn("hidden h-5 w-px md:block", open ? "bg-sunny-ink/20" : "bg-sunny-ink/15")} />

            {newest ? (
                <span className="flex min-w-0 items-center gap-2 max-md:order-3 max-md:basis-full">
                    <Who name={newest.name} detail={readDetail(newest, newest.userId === myId)}>
                        {newest.userId === myId ? <MyFace open={open} size="sm" /> : newest.role === "visitor" ? <VisitorFace open={open} size="sm" /> : <Initials name={newest.name} id={newest.userId} size="sm" open={open} />}
                    </Who>
                    <span className="truncate"><b className="font-semibold">{newest.name}</b><span className={muted}> read · {formatAgo(newest.at)}</span></span>
                    {reads.length > 1 && <span className={cn("flex-none text-xs", muted)} title={reads.slice(1).map((read) => (read.role === "visitor" && read.device ? `${read.name} (${read.device})` : read.name)).join(", ")}>+{reads.length - 1}</span>}
                </span>
            ) : (
                <span className={cn(muted, "max-md:order-3 max-md:basis-full")}>{driveInfo.lastReadAt ? `Last read ${formatAgo(driveInfo.lastReadAt)}` : "Not read yet"}</span>
            )}

            <button type="button" onClick={(event) => { event.stopPropagation(); onAll(); }} className="ml-auto flex min-h-7 cursor-pointer items-center text-xs font-semibold underline max-md:order-2 underline-offset-[3px] outline-sunny-ink focus-visible:outline-2">All activity</button>
        </div>
    );
}

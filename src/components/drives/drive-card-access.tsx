import { useState } from "react";
import { Check, Copy, Globe } from "lucide-react";
import type { DriveInfo } from "@/engine";
import { initialsOf } from "@/components/profile/avatar-presets";
import { UserAvatar } from "@/components/profile/user-avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { faceFill, peopleLine, READ_SEGMENT_LABEL, readSegmentOf, rolesLine } from "./drive-access-text";
import { formatWhen } from "./drive-stats-format";

/** The faces of the others take these fills, each person always the same one (by their id), so that they are told apart and none is yellow, which the open card is. */
const FILLS = ["bg-white text-sunny-ink", "bg-sunny-ink text-sunny-yellow", "bg-[#e9e8e3] text-sunny-ink", "bg-[#3a372f] text-white"];
/** On the yellow card of an open drive every face has a faint dark edge, the person's own included. */
const EDGE_ON_YELLOW = "outline outline-1 outline-sunny-ink/35";

const HEADING = "text-[11px] font-semibold uppercase tracking-[0.08em]";

function Initials({ name, id, size, open }: { name: string, id: string, size: "sm" | "md", open: boolean }) {
    return (
        <span
            aria-hidden="true"
            className={cn(
                "flex flex-none items-center justify-center rounded-full font-semibold shadow-[inset_0_0_0_1px_rgba(29,28,25,0.14)]",
                open ? `ring-2 ring-sunny-yellow-surface ${EDGE_ON_YELLOW}` : "ring-2 ring-white",
                size === "md" ? "size-[30px] text-[11px]" : "size-6 text-[9px]",
                FILLS[faceFill(id, FILLS.length)],
            )}
        >
            {initialsOf(name)}
        </span>
    );
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

/** Who can open the drive: only you, anyone with the link (and the people besides, if there are any), or the people on it. */
export function AccessBlock({ driveInfo, open }: { driveInfo: DriveInfo, open: boolean }) {
    const [copied, setCopied] = useState(false);
    const hasPeople = driveInfo.accessTotal > 1;
    const muted = open ? "text-sunny-text-on-yellow" : "text-sunny-muted";
    const owner = driveInfo.myRole !== "owner" ? (driveInfo.ownerName || driveInfo.ownerEmail || "the owner") : undefined;

    async function copy() {
        if (!driveInfo.publicLink) return;
        try {
            await navigator.clipboard.writeText(driveInfo.publicLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch { /* nothing to copy to: the link is in the drive's settings */ }
    }

    return (
        <div className="flex min-w-0 flex-[1_1_340px] flex-col gap-2">
            <span className={cn(HEADING, muted)}>Access</span>

            {driveInfo.visibility === "public" && (
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                    <span aria-hidden="true" className={cn("flex size-[30px] flex-none items-center justify-center rounded-full", open ? "bg-white/60" : "bg-sunny-field")}><Globe className="size-4" strokeWidth={2} /></span>
                    <span className="flex flex-col">
                        <span className="text-[13px] font-semibold">Anyone with the link</span>
                        <span className={cn("text-xs", muted)}>No sign-in needed</span>
                    </span>
                    {driveInfo.publicLink && (
                        <button type="button" onClick={(event) => { event.stopPropagation(); void copy(); }} className="ml-1.5 flex min-h-8 cursor-pointer items-center gap-1.5 text-[13px] font-semibold underline underline-offset-[3px] outline-sunny-ink focus-visible:outline-2">
                            {copied ? <Check aria-hidden="true" className="size-3.5" strokeWidth={2.4} /> : <Copy aria-hidden="true" className="size-3.5" strokeWidth={2} />}
                            <span>{copied ? "Copied" : "Copy link"}</span>
                        </button>
                    )}
                </div>
            )}

            {driveInfo.visibility === "private" || (!hasPeople && driveInfo.visibility !== "public") ? (
                <div className="flex items-center gap-2.5">
                    <MyFace open={open} />
                    <span className="flex flex-col">
                        <span className="text-[13px] font-semibold">Only you</span>
                        <span className={cn("text-xs", muted)}>Nobody else can read this drive</span>
                    </span>
                </div>
            ) : hasPeople && (
                <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex flex-none pl-1.5">
                        {driveInfo.accessPeople.map((person) => (
                            <span key={person.id} className="-ml-1.5">
                                <Who name={person.isMe ? "You" : person.name} detail={person.role[0].toUpperCase() + person.role.slice(1)}>
                                    {person.isMe ? <MyFace open={open} /> : <Initials name={person.name} id={person.id} size="md" open={open} />}
                                </Who>
                            </span>
                        ))}
                    </span>
                    <span className="flex min-w-0 flex-col">
                        <span className="truncate text-[13px] font-semibold">{peopleLine(driveInfo.accessPeople.map((person) => person.name), driveInfo.accessTotal)}</span>
                        <span className={cn("truncate text-xs", muted)}>
                            {rolesLine(driveInfo.accessRoles) || (owner ? `Owner: ${owner} · ${driveInfo.accessTotal} ${driveInfo.accessTotal === 1 ? "person" : "people"}` : `${driveInfo.accessTotal} people`)}
                        </span>
                    </span>
                </div>
            )}
        </div>
    );
}

function MyFace({ open }: { open: boolean }) {
    return <UserAvatar className={cn("size-[30px] ring-2", open ? `ring-sunny-yellow-surface ${EDGE_ON_YELLOW}` : "ring-white")} />;
}

const READER_FACES = 8;

/**
 * Who read the drive lately: one line of faces, the newest reader first, and the time of the newest read rounded to a stretch ("Last hour", "Today",
 * "Yesterday", "This week", "Earlier"). Hovering a face tells the name, the role and how long ago that person read. Everyone on the drive sees the same
 * readers; the person's own face is their picture.
 */
export function RecentReadsBlock({ driveInfo, open, onAll }: { driveInfo: DriveInfo, open: boolean, onAll: () => void }) {
    const muted = open ? "text-sunny-text-on-yellow" : "text-sunny-muted";
    const myId = driveInfo.accessPeople.find((person) => person.isMe)?.id;
    const reads = [...driveInfo.recentReads].sort((a, b) => b.at - a.at);
    return (
        <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-1.5">
            <div className="flex min-h-[18px] items-center justify-between gap-2">
                <span className={cn(HEADING, muted)}>Recent reads</span>
                <button type="button" onClick={(event) => { event.stopPropagation(); onAll(); }} className="flex cursor-pointer items-center gap-1 text-xs font-semibold underline underline-offset-[3px] outline-sunny-ink focus-visible:outline-2">All activity</button>
            </div>
            {reads.length > 0 ? (
                <div className="flex min-h-[30px] items-center gap-3">
                    <span className="flex min-w-0 items-center pl-1" role="list" aria-label={`Read by ${reads.map((read) => read.name).join(", ")}`}>
                        {reads.slice(0, READER_FACES).map((read) => (
                            <span key={read.userId} role="listitem" className="-ml-1">
                                <Who name={read.name} detail={`${read.userId === myId ? "" : `${read.role[0].toUpperCase()}${read.role.slice(1)} · `}${read.kind === "opened" ? "Opened the drive" : "Read files"} ${formatWhen(read.at)}`}>
                                    {read.userId === myId
                                        ? <UserAvatar className={cn("size-6 ring-2", open ? `ring-sunny-yellow-surface ${EDGE_ON_YELLOW}` : "ring-white")} />
                                        : <Initials name={read.name} id={read.userId} size="sm" open={open} />}
                                </Who>
                            </span>
                        ))}
                        {reads.length > READER_FACES && <span className={cn("ml-2 text-xs", muted)}>+{reads.length - READER_FACES}</span>}
                    </span>
                    <span className={cn("text-xs", muted)}>{READ_SEGMENT_LABEL[readSegmentOf(reads[0].at, Date.now())]}</span>
                </div>
            ) : (
                <span className={cn("flex min-h-[30px] items-center text-[13px]", muted)}>
                    {driveInfo.lastReadAt ? `Last read ${formatWhen(driveInfo.lastReadAt)}` : "Not read yet"}
                </span>
            )}
        </div>
    );
}

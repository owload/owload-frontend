import { DriveInfo } from "@/engine";
import { Folder, Globe, Inbox, Lock, LockOpen, SlidersHorizontal, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { DriveIcon } from "./drive-icon";
import { DRIVE_KIND_LABEL, DriveKind } from "./drive-kind";
import { InfoLine } from "./drive-card-access";
import { formatBytes, usedPercent } from "./drive-stats-format";
import { useDriveActions } from "./use-drive-actions";

const iconButton = "flex size-11 flex-none cursor-pointer items-center justify-center rounded-[10px] text-sunny-ink outline-sunny-ink hover:bg-sunny-ink/10 focus-visible:outline-2 focus-visible:outline-offset-2";
/** A button on the card does its own thing and does not also open the drive (a click anywhere else on the card does). */
const stop = (action: () => void) => (event: React.MouseEvent) => {
    event.stopPropagation();
    action();
};

const KIND_ICON = { private: Lock, shared: Users, public: Globe, "with-me": Inbox } as const;
const textButton = "flex h-11 cursor-pointer items-center justify-center gap-2 rounded-[10px] px-4 font-semibold max-md:px-2.5 outline-sunny-ink focus-visible:outline-2 focus-visible:outline-offset-2";
/** The button that opens the drive takes the rest of the row on a phone. */
const mainButton = "max-md:flex-1";
/** The two buttons of an open drive ("Browse files" and "Close") are alike: the same width, sharing the row on a phone. */
const pairButton = "max-md:flex-1 md:w-36";

/**
 * A drive of the list. An open drive is the yellow card with its size and bar and what can be done with it; a closed
 * one is a white card of the same shape that shows only what is known while the drive is closed.
 */
export function DriveCard({ driveInfo, kind }: { driveInfo: DriveInfo, kind: DriveKind }) {
    const { driveOpen, passwordIsWrong, description, usedBytes, browse, close, tryAgain, settings, logs } = useDriveActions(driveInfo);
    const showsContents = driveOpen && !passwordIsWrong;
    const percent = usedPercent(usedBytes, driveInfo.storedBytes);
    const stored = driveInfo.storedBytes == null ? "…" : formatBytes(driveInfo.storedBytes); // the server is still counting
    const kindLabel = DRIVE_KIND_LABEL[kind];
    const KindIcon = KIND_ICON[kind];
    const roleLabel = `${driveInfo.myRole[0].toUpperCase()}${driveInfo.myRole.slice(1)}`;
    const sharedBy = kind === "with-me" ? (driveInfo.ownerName || driveInfo.ownerEmail || "its owner") : undefined;
    const StateIcon = showsContents ? LockOpen : Lock;
    const stateLabel = passwordIsWrong ? "Wrong password" : showsContents ? "Open" : "Closed";

    return (
        <article
            onClick={browse}
            className={cn(
                "relative flex cursor-pointer flex-col rounded-2xl text-sunny-ink",
                showsContents
                    ? "bg-sunny-yellow-surface shadow-[0_14px_32px_rgba(0,0,0,0.14)]"
                    : "border bg-white shadow-[0_6px_18px_rgba(0,0,0,0.06)]",
                !showsContents && (passwordIsWrong ? "border-destructive" : "border-sunny-line"),
            )}
        >
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 px-[18px] py-4">
                <div className="flex min-w-0 flex-[1_1_440px] items-center gap-3.5">
                    <span aria-hidden="true" className={cn("flex size-11 flex-none items-center justify-center rounded-xl", showsContents ? "bg-sunny-ink text-sunny-yellow" : "bg-sunny-field text-sunny-ink")}>
                        <DriveIcon driveInfo={driveInfo} className="size-5" />
                    </span>
                    <div className="flex min-w-0 flex-col gap-1">
                        <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1">
                            <h2 className="m-0 min-w-0 max-w-full truncate text-[19px] font-semibold leading-tight">{driveInfo.title}</h2>
                            <div className="hidden md:contents">
                                <span className="inline-flex h-[26px] flex-none items-center gap-1.5 whitespace-nowrap rounded-lg bg-sunny-ink px-2.5 text-[13px] font-semibold text-sunny-yellow">
                                    <KindIcon aria-hidden="true" className="size-[13px]" strokeWidth={2.2} />
                                    <span>{kindLabel}</span>
                                </span>
                                <span className={cn("inline-flex h-[26px] flex-none items-center whitespace-nowrap rounded-lg px-2.5 text-[13px] font-semibold", showsContents ? "bg-sunny-ink/10" : "bg-sunny-field")}>{roleLabel}</span>
                                {sharedBy && <span className={cn("text-xs", showsContents ? "text-sunny-text-on-yellow" : "text-sunny-muted")}>from <b className="font-semibold text-sunny-ink">{sharedBy}</b></span>}
                                <span className={cn("flex flex-none items-center gap-[5px] text-[11px] font-semibold uppercase tracking-[0.08em]", passwordIsWrong ? "text-destructive" : showsContents ? "text-sunny-text-on-yellow" : "text-sunny-muted")}>
                                    <StateIcon aria-hidden="true" className="size-3" strokeWidth={2.2} />
                                    <span>{stateLabel}</span>
                                </span>
                            </div>
                        </div>
                        <span className={cn("truncate text-[13px]", showsContents ? "text-sunny-text-on-yellow" : "text-sunny-muted")}>
                            {showsContents ? (description || "—") : "Description hidden while closed"}
                        </span>
                    </div>
                </div>

                <div className="flex w-full flex-wrap items-center gap-2 md:hidden">
                    <span className={cn("inline-flex h-[26px] flex-none items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 text-[13px] font-semibold", passwordIsWrong ? "border-destructive text-destructive" : "border-sunny-ink/70")}>
                        <StateIcon aria-hidden="true" className="size-3" strokeWidth={2.2} />
                        <span>{stateLabel}</span>
                    </span>
                    <span className="inline-flex h-[26px] flex-none items-center gap-1.5 whitespace-nowrap rounded-lg bg-sunny-ink px-2.5 text-[13px] font-semibold text-sunny-yellow">
                        <KindIcon aria-hidden="true" className="size-[13px]" strokeWidth={2.2} />
                        <span>{kindLabel}</span>
                    </span>
                    <span className={cn("inline-flex h-[26px] flex-none items-center whitespace-nowrap rounded-lg px-2.5 text-[13px] font-semibold", showsContents ? "bg-sunny-ink/10" : "bg-sunny-field")}>{roleLabel}</span>
                    {sharedBy && <span className={cn("text-xs", showsContents ? "text-sunny-text-on-yellow" : "text-sunny-muted")}>from <b className="font-semibold text-sunny-ink">{sharedBy}</b></span>}
                </div>

                <div className="flex min-w-[180px] max-w-[300px] flex-[1_1_220px] flex-col gap-1.5 max-md:max-w-none max-md:basis-full">
                    <div className="flex items-baseline gap-2">
                        <span className="whitespace-nowrap text-xl font-semibold leading-none">{showsContents && usedBytes !== undefined ? formatBytes(usedBytes) : stored}</span>
                        <span className={cn("whitespace-nowrap text-[13px]", showsContents ? "text-sunny-text-on-yellow" : "text-sunny-muted")}>
                            {showsContents ? `of ${stored}` : "total"}
                        </span>
                    </div>
                    {showsContents && percent !== undefined ? (
                        <div role="img" aria-label={`Files take ${percent} percent of the ${stored} stored on the servers`} title="Files take this much of what is stored; the rest is old versions and previews" className="h-1 overflow-hidden rounded-full bg-sunny-ink/20">
                            <div className="h-full rounded-full bg-sunny-ink" style={{ width: `${percent}%` }} />
                        </div>
                    ) : <div aria-hidden="true" className={cn("h-1 rounded-full", showsContents ? "bg-sunny-ink/20" : "bg-sunny-line")} />}
                </div>

                <div className="flex w-full flex-wrap items-center gap-2 max-md:gap-1 md:ml-auto md:w-auto md:flex-none">
                    {passwordIsWrong && <>
                        <button type="button" onClick={stop(tryAgain)} className={cn(textButton, pairButton, "bg-sunny-ink text-sunny-yellow hover:bg-sunny-ink/90")}>Try again</button>
                        <button type="button" onClick={stop(close)} aria-label="Close drive" className={cn(textButton, pairButton, "border border-sunny-ink hover:bg-sunny-ink/10")}>Close</button>
                    </>}
                    {showsContents && <>
                        <button type="button" onClick={stop(browse)} className={cn(textButton, pairButton, "bg-sunny-ink text-sunny-yellow hover:bg-sunny-ink/90")}>
                            <Folder aria-hidden="true" className="size-4" strokeWidth={2} />Browse files
                        </button>
                        <button type="button" onClick={stop(close)} aria-label="Close drive" className={cn(textButton, pairButton, "border border-sunny-ink hover:bg-sunny-ink/10")}>Close</button>
                    </>}
                    {!driveOpen && (
                        <button type="button" onClick={stop(browse)} className={cn(textButton, mainButton, "bg-sunny-yellow px-[18px] hover:bg-sunny-yellow-edge")}>
                            <LockOpen aria-hidden="true" className="size-4" strokeWidth={2} />Open drive
                        </button>
                    )}
                    {!passwordIsWrong && (
                        <button type="button" aria-label={`Drive settings for ${driveInfo.title}`} title="Drive settings" onClick={stop(settings)} className={iconButton}>
                            <SlidersHorizontal aria-hidden="true" className="size-[18px]" strokeWidth={2} />
                        </button>
                    )}
                </div>
            </div>

            <InfoLine driveInfo={driveInfo} open={showsContents} onAll={logs} />
        </article>
    );
}

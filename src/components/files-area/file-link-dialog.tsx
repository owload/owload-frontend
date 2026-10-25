import { useState, useSyncExternalStore } from "react";
import { Check, Copy, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface LinkRequest {
    id: number;
    name: string;
    isDir: boolean;
    link: string;
}

let current: LinkRequest | undefined;
let counter = 0;
const listeners = new Set<() => void>();

function publish(next: LinkRequest | undefined) {
    current = next;
    listeners.forEach((listener) => listener());
}

/** Opens the dialog with the link to a file or folder of a public drive (`FileLinkDialog` is where it is shown). */
export function openFileLinkDialog(request: Omit<LinkRequest, "id">) {
    publish({ ...request, id: ++counter });
}

/**
 * The link to one file or folder of a public drive, with what the person giving it may not know: the link opens the whole drive, not only
 * that item (owload-docs/decisions/0041). One is placed on the page of a drive.
 */
export function FileLinkDialog() {
    const request = useSyncExternalStore(
        (listener) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
        () => current,
    );
    return (
        <Dialog open={request !== undefined} onOpenChange={(open) => { if (!open) publish(undefined); }}>
            {request && <LinkDialogContent key={request.id} request={request} />}
        </Dialog>
    );
}

function LinkDialogContent({ request }: { request: LinkRequest }) {
    const [copied, setCopied] = useState(false);
    const [failed, setFailed] = useState(false);
    const kind = request.isDir ? "folder" : "file";

    async function copy() {
        try {
            await navigator.clipboard.writeText(request.link);
            setCopied(true);
            setFailed(false);
            setTimeout(() => setCopied(false), 2500);
        } catch {
            setFailed(true); // the link is selected in the field above: it can be copied by hand
        }
    }

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Link to the {kind}</DialogTitle>
                <DialogDescription className="break-words">{request.name}</DialogDescription>
            </DialogHeader>
            <div role="note" className="flex items-start gap-3 rounded-xl bg-sunny-yellow-soft px-4 py-3 text-sm text-sunny-ink">
                <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 flex-none" strokeWidth={2.2} />
                <p className="m-0 leading-snug">
                    <b className="font-semibold">This link opens the whole drive, not only this {kind}.</b>{" "}
                    Whoever has it and the drive's password can see every file and folder in the drive. The link takes them to this {kind} first.
                </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
                <input
                    readOnly
                    aria-label="Link"
                    value={request.link}
                    onFocus={(event) => event.currentTarget.select()}
                    className="h-11 min-w-0 flex-1 rounded-[10px] border border-input bg-background px-3 text-sm outline-ring focus-visible:outline-2"
                />
                <Button onClick={() => void copy()} className="h-11 gap-2 sm:w-36">
                    {copied ? <Check aria-hidden="true" className="size-4" /> : <Copy aria-hidden="true" className="size-4" />}
                    {copied ? "Copied" : "Copy link"}
                </Button>
            </div>
            {failed && <p role="alert" className="m-0 text-sm font-semibold text-[#b3261e]">The link could not be copied. Select it above and copy it by hand.</p>}
        </DialogContent>
    );
}

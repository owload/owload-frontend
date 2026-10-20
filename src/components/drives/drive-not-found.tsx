import { FolderX } from "lucide-react";
import { Link } from "react-router-dom";

/** What a drive's address shows when the drive is not in the user's list: it never existed, was deleted, or is not shared with them any more. */
export function DriveNotFound() {
    return (
        <div className="absolute inset-x-0 bottom-0 top-18 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <span aria-hidden="true" className="flex size-14 items-center justify-center rounded-full bg-sunny-field text-sunny-muted">
                <FolderX className="size-7" strokeWidth={1.8} />
            </span>
            <h1 className="m-0 text-[22px] font-semibold text-sunny-ink">Drive not found</h1>
            <p className="m-0 max-w-sm text-sm leading-normal text-sunny-muted">
                This drive does not exist, or it was deleted, or it is no longer shared with you.
            </p>
            <Link to="/" className="mt-1 flex h-11 items-center rounded-[10px] bg-sunny-yellow px-5 text-sm font-semibold text-sunny-ink outline-sunny-ink hover:bg-sunny-yellow-edge focus-visible:outline-2 focus-visible:outline-offset-2">
                Go to My drives
            </Link>
        </div>
    );
}

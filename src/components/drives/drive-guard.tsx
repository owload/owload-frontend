import type { ReactNode } from "react";
import { useParams } from "react-router-dom";
import { useFilesStore } from "@/stores/files-store";
import { DriveAccessGate } from "./drive-access-gate";

/**
 * A page of one drive, shown only when the drive is in the user's list. For an address of a drive that is not (it does not exist, or the user
 * is not on it) the page is the one for that: "Drive not found", or the request for access (owload-docs/decisions/0037). Until the list of drives
 * has arrived nothing of the page is drawn, so that it does not load a drive it may not be allowed to.
 */
export function DriveGuard({ children }: { children: ReactNode }) {
    const { driveId } = useParams();
    const drivesInitialized = useFilesStore((state) => state.drivesInitialized);
    const known = useFilesStore((state) => state.drives.some((drive) => drive.id === driveId));
    if (!drivesInitialized) return <div aria-hidden="true" className="absolute inset-x-0 bottom-0 top-18" />;
    if (!known) return <DriveAccessGate driveId={driveId} />;
    return <>{children}</>;
}

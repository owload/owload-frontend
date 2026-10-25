import { useParams } from "react-router-dom";
import { openFileLinkDialog } from "@/components/files-area/file-link-dialog";
import { fileLink } from "@/lib/file-link";
import { useFilesStore } from "@/stores/files-store";

/**
 * Shows the link to a file or folder of the open drive, when the drive is public and its link is known: to a visitor of the link, and to the
 * owner and the admins, who have it in the drive's settings. Otherwise undefined: nobody else can give a link that opens the drive.
 */
export function useShowFileLink(): ((item: { id: string, name: string, isDir: boolean }) => void) | undefined {
    const { driveId } = useParams();
    const publicToken = useFilesStore((state) => state.publicToken);
    const publicLink = useFilesStore((state) => state.drives.find((drive) => drive.id === driveId)?.publicLink);
    const driveLink = publicToken ? `${window.location.origin}/p/${publicToken}` : publicLink;
    if (!driveLink) return undefined;
    return (item) => openFileLinkDialog({ name: item.name, isDir: item.isDir, link: fileLink(driveLink, item.id) });
}

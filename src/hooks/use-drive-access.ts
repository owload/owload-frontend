import { useCallback, useEffect, useState } from "react";
import { RestAccessBackend, type AccessRequest, type AddPersonResult, type DriveAccess } from "@/engine/backend/access-backend";
import type { DriveId, DriveRole, DriveVisibility } from "@/engine/backend/drive-backend";

const backend = new RestAccessBackend();

/** Who can open a drive, and changing that. `access` is undefined until it arrives. Each change rejects when the backend refuses it. */
export function useDriveAccess(driveId: DriveId | undefined) {
    const [access, setAccess] = useState<DriveAccess | undefined>();
    const [failed, setFailed] = useState(false);
    // the people who asked to be let in; only the owner and the admins are told them
    const [requests, setRequests] = useState<AccessRequest[]>([]);

    const reload = useCallback(async () => {
        if (!driveId) return;
        try {
            const loaded = await backend.getAccess(driveId);
            setAccess(loaded);
            setFailed(false);
            if (loaded.myRole === "owner" || loaded.myRole === "admin") {
                setRequests(await backend.listAccessRequests(driveId).catch(() => []));
            } else {
                setRequests([]);
            }
        } catch {
            setFailed(true);
        }
    }, [driveId]);

    useEffect(() => { setAccess(undefined); setRequests([]); void reload(); }, [reload]);

    const setVisibility = useCallback(async (visibility: DriveVisibility) => {
        setAccess(await backend.setVisibility(driveId!, visibility));
    }, [driveId]);

    const resetLink = useCallback(async () => {
        setAccess(await backend.resetPublicLink(driveId!));
    }, [driveId]);

    const addPerson = useCallback(async (email: string, role: DriveRole): Promise<AddPersonResult> => {
        const result = await backend.addPerson(driveId!, email, role);
        await reload();
        return result;
    }, [driveId, reload]);

    const changeRole = useCallback(async (personId: string, role: DriveRole) => {
        await backend.changeRole(driveId!, personId, role);
        await reload();
    }, [driveId, reload]);

    const removePerson = useCallback(async (personId: string) => {
        await backend.removePerson(driveId!, personId);
        await reload();
    }, [driveId, reload]);

    const leave = useCallback(() => backend.leaveDrive(driveId!), [driveId]);

    const approveRequest = useCallback(async (userId: string, role: DriveRole): Promise<AddPersonResult> => {
        const result = await backend.approveAccessRequest(driveId!, userId, role);
        await reload();
        return result;
    }, [driveId, reload]);

    const declineRequest = useCallback(async (userId: string) => {
        await backend.declineAccessRequest(driveId!, userId);
        await reload();
    }, [driveId, reload]);

    return { access, failed, reload, requests, setVisibility, resetLink, addPerson, changeRole, removePerson, leave, approveRequest, declineRequest };
}

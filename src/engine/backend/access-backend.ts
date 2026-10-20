import { deleteApiCall, getApiCall, patchApiCall, postApiCall, putApiCall } from "../api/api";
import type { DriveId, DriveRole, DriveVisibility, MyDriveRole } from "./drive-backend";

/** Someone a drive is shared with. `invited` is a person who has no verified account with that email yet: the drive reaches them when they sign in with it. */
export interface DrivePerson {
    /** The user id of a member, or the id of the invitation. */
    id: string;
    status: "member" | "invited";
    email: string;
    name: string | null;
    role: DriveRole;
    since: string | null;
}

export interface DriveAccess {
    visibility: DriveVisibility;
    myRole: MyDriveRole;
    /** The link of a public drive; only the owner and the admins get it. */
    publicLink: string | null;
    /** Only the owner and the admins get the list. */
    people: DrivePerson[];
    /** Whether the backend can send the invitations by mail itself. */
    mailEnabled: boolean;
}

export interface AddPersonResult {
    person: DrivePerson;
    emailSent: boolean;
    /** The address of the app, for the person to be sent to when no mail went out. */
    appUrl: string;
}

/** What a signed-in person is told about a drive they may not be on (GET /drives/{id}/access-request): that it exists, its title, and whether they have asked. */
export interface MyAccessRequest {
    driveId: DriveId;
    /** True once the person is on the drive (for example after an admin answered): the drive is theirs to open. */
    hasAccess: boolean;
    title: string;
    requested: boolean;
    /** ISO date and time of the request. */
    requestedAt: string | null;
    message: string | null;
    mailEnabled: boolean;
}

/** A pending request for access, for the owner and the admins of the drive. */
export interface AccessRequest {
    userId: string;
    name: string | null;
    email: string;
    message: string | null;
    requestedAt: string;
}

export const ACCESS_MESSAGE_MAX = 500;

export abstract class AccessBackend {
    abstract getMyAccessRequest(driveId: DriveId): Promise<MyAccessRequest>;
    abstract requestAccess(driveId: DriveId, message: string): Promise<MyAccessRequest>;
    abstract cancelAccessRequest(driveId: DriveId): Promise<void>;
    abstract listAccessRequests(driveId: DriveId): Promise<AccessRequest[]>;
    abstract approveAccessRequest(driveId: DriveId, userId: string, role: DriveRole): Promise<AddPersonResult>;
    abstract declineAccessRequest(driveId: DriveId, userId: string): Promise<void>;
    abstract getAccess(driveId: DriveId): Promise<DriveAccess>;
    abstract setVisibility(driveId: DriveId, visibility: DriveVisibility): Promise<DriveAccess>;
    abstract resetPublicLink(driveId: DriveId): Promise<DriveAccess>;
    abstract addPerson(driveId: DriveId, email: string, role: DriveRole): Promise<AddPersonResult>;
    abstract changeRole(driveId: DriveId, personId: string, role: DriveRole): Promise<DrivePerson>;
    abstract removePerson(driveId: DriveId, personId: string): Promise<void>;
    abstract leaveDrive(driveId: DriveId): Promise<void>;
}

export class RestAccessBackend implements AccessBackend {
    getMyAccessRequest(driveId: DriveId): Promise<MyAccessRequest> {
        return getApiCall(`/drives/${driveId}/access-request`);
    }

    requestAccess(driveId: DriveId, message: string): Promise<MyAccessRequest> {
        return postApiCall(`/drives/${driveId}/access-request`, { message: message.trim() || null });
    }

    cancelAccessRequest(driveId: DriveId): Promise<void> {
        return deleteApiCall(`/drives/${driveId}/access-request`);
    }

    listAccessRequests(driveId: DriveId): Promise<AccessRequest[]> {
        return getApiCall(`/drives/${driveId}/access/requests`);
    }

    approveAccessRequest(driveId: DriveId, userId: string, role: DriveRole): Promise<AddPersonResult> {
        return postApiCall(`/drives/${driveId}/access/requests/${encodeURIComponent(userId)}/approve`, { role });
    }

    declineAccessRequest(driveId: DriveId, userId: string): Promise<void> {
        return deleteApiCall(`/drives/${driveId}/access/requests/${encodeURIComponent(userId)}`);
    }

    getAccess(driveId: DriveId): Promise<DriveAccess> {
        return getApiCall(`/drives/${driveId}/access`);
    }

    setVisibility(driveId: DriveId, visibility: DriveVisibility): Promise<DriveAccess> {
        return putApiCall(`/drives/${driveId}/access/visibility`, { visibility });
    }

    resetPublicLink(driveId: DriveId): Promise<DriveAccess> {
        return postApiCall(`/drives/${driveId}/access/link/reset`);
    }

    addPerson(driveId: DriveId, email: string, role: DriveRole): Promise<AddPersonResult> {
        return postApiCall(`/drives/${driveId}/access/people`, { email, role });
    }

    changeRole(driveId: DriveId, personId: string, role: DriveRole): Promise<DrivePerson> {
        return patchApiCall(`/drives/${driveId}/access/people/${encodeURIComponent(personId)}`, { role });
    }

    removePerson(driveId: DriveId, personId: string): Promise<void> {
        return deleteApiCall(`/drives/${driveId}/access/people/${encodeURIComponent(personId)}`);
    }

    leaveDrive(driveId: DriveId): Promise<void> {
        return deleteApiCall(`/drives/${driveId}/access/me`);
    }
}

/** What a viewer needs to set a public drive up (GET /public/{token}); the owner is shown by name, nobody else is. */
export interface PublicDriveInfo {
    id: DriveId;
    title: string;
    keyNonce: string;
    counterNonce: string;
    createdTimestamp: number;
    dataLength: number;
    ownerName: string | null;
    lastReadAt?: number | null;
}

/** Reads the description of a public drive; rejects with a 404 for a link that does not work (wrong, old or turned off). */
export function getPublicDriveInfo(token: string): Promise<PublicDriveInfo> {
    return getApiCall(`/public/${encodeURIComponent(token)}`);
}

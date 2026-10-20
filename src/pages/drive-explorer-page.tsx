
import { useFilesStore } from '@/stores/files-store';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useFilesStoreOps } from '@/hooks/use-files-store-ops';
import { AbortContext } from '@/types/types';
import { DialogClosedError } from '@/types/errors';
import { useOpenFileProperties } from '@/hooks/use-dialogs';
import { useCanWrite } from '@/hooks/use-drive-role';
import { Eye } from 'lucide-react';
import { DriveNotFound } from '@/components/drives/drive-not-found';

export function DriveExplorerPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileNotFound = (location.state as any)?.fileNotFound === true;
  const notFoundNodeId: string | undefined = (location.state as any)?.notFoundNodeId;

  const passwordRetryFlag = useFilesStore((state) => state.passwordRetryFlag);
  const setPasswordRetryFlag = useFilesStore((state) => state.setPasswordRetryFlag);

  const setMediaPreviewOpen = useFilesStore((state) => state.setMediaPreviewOpen);
  const setEditorOpen = useFilesStore((state) => state.setEditorOpen);
  const setNewEditorFile = useFilesStore((state) => state.setNewEditorFile);
  const drivesInitialized = useFilesStore((state) => state.drivesInitialized);

  const { driveId, dirId } = useParams();
  // an address of a drive that is not in the list (it never existed, was deleted, or is not shared with the user): nothing to open
  const driveKnown = useFilesStore((state) => state.drives.some((d) => d.id === driveId));
  const driveKey = useFilesStore((state) => driveId ? state.driveKeys[driveId] : undefined);


  const { initialize, cdByDirId, cd, sync } = useFilesStoreOps();
  const filesInitialized = useFilesStore((state) => state.filesInitialized);
  const setFilesInitialized = useFilesStore((state) => state.setFilesInitialized);
  const clearFiles = useFilesStore((state) => state.clearFiles);

  useEffect(() => {
    if (!drivesInitialized || !driveKnown) {
      return;
    }
    setFilesInitialized(false);

    const abortContext: AbortContext = { aborted: false };
    const initialPath = "";
    initialize(driveId!, undefined, initialPath, abortContext)
      .then(async () => {
        if (abortContext.aborted) {
          return;
        }
        if (dirId) {
          const found = await cdByDirId(dirId);
          if (!found) {
            navigate(`/drive/${driveId}`, { state: { fileNotFound: true, notFoundNodeId: dirId } });
          }
        } else {
          sync();
        }
        setFilesInitialized(true);
      })
      .catch((error) => {
        if (error instanceof DialogClosedError) {
          navigate("/");
        } else {
          throw error;
        }
      })
      .finally(() => {
        if (passwordRetryFlag) {
          setPasswordRetryFlag(false);
        }
      });
    return () => {
      abortContext.aborted = true;
      if (useFilesStore.getState().filesInitialized) {
        setFilesInitialized(false);
      }
    }
  }, [passwordRetryFlag, driveId, drivesInitialized, driveKnown]);

  useEffect(() => {
    if (!filesInitialized) {
      return;
    }
    setMediaPreviewOpen(false);
    setEditorOpen(false);
    setNewEditorFile(null);
    if (dirId) {
      cdByDirId(dirId).then(found => {
        if (!found) {
          navigate(`/drive/${driveId}`, { state: { fileNotFound: true, notFoundNodeId: dirId } });
        }
      });
    } else {
      cd("/");
    }
  }, [dirId]);

  useEffect(() => {
    return () => {
      clearFiles();
    };
  }, [driveId]);

  useEffect(() => {
    if (filesInitialized && !driveKey) {
      navigate('/');
    }
  }, [driveKey, filesInitialized]);


  // The notices under the top bar take room: the pages below start under them (they read `--banner-h`) instead of being covered.
  const bannerStack = useRef<HTMLDivElement>(null);
  const [bannerHeight, setBannerHeight] = useState(0);
  useLayoutEffect(() => {
    const element = bannerStack.current;
    if (!element) return;
    const measure = () => setBannerHeight(element.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const openFileProperties = useOpenFileProperties();
  // "Got it" closes the notice for as long as the window stays on this drive; it is not remembered, so it comes back every time the drive is opened.
  const [viewOnlyDismissed, setViewOnlyDismissed] = useState(false);
  useEffect(() => { setViewOnlyDismissed(false); }, [driveId]);
  const canWrite = useCanWrite();
  const publicToken = useFilesStore((state) => state.publicToken);

  if (drivesInitialized && !driveKnown) return <DriveNotFound />;

  return (
    <div className="contents" style={{ '--banner-h': `${bannerHeight}px` } as React.CSSProperties}>
      <div ref={bannerStack} className="absolute top-18 inset-x-0 z-40 flex flex-col">
        {fileNotFound && (
          <div className="flex items-center gap-3 border-b border-[#f0d3bd] bg-[#fbeee4] px-4 py-2 text-sm font-medium text-sunny-orange">
            <span>This file no longer exists.</span>
            {notFoundNodeId && (
              <button
                className="underline hover:opacity-80"
                onClick={() => openFileProperties({ nodeId: notFoundNodeId, filePath: '', byteLength: 0 }).catch(() => {})}
              >
                View properties
              </button>
            )}
            <button
              className="ml-auto hover:opacity-80"
              onClick={() => navigate(location.pathname, { replace: true, state: {} })}
            >✕</button>
          </div>
        )}
        {!canWrite && !viewOnlyDismissed && (
          <div className="px-4 pt-3 md:px-7">
            <div role="status" className="flex items-center gap-3 rounded-xl bg-sunny-yellow-soft px-4 py-3 text-sm text-sunny-ink">
              <Eye aria-hidden="true" className="size-4 flex-none" strokeWidth={2.2} />
              <p className="m-0 min-w-0 flex-1 leading-snug">
                <b className="font-semibold">View only.</b>{" "}
                {publicToken ? "You can view and download the files of this public drive, but not change them." : "You can view and download files in this drive, but not change them."}
              </p>
              <button type="button" onClick={() => setViewOnlyDismissed(true)} className="flex-none cursor-pointer rounded-md px-2 py-1 font-semibold outline-sunny-ink hover:bg-sunny-ink/10 focus-visible:outline-2">
                Got it
              </button>
            </div>
          </div>
        )}
      </div>
      <Outlet />
    </div>
  )
}

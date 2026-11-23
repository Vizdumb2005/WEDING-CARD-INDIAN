import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  type User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

/**
 * Least-privilege Google Drive scope: only accesses/manages the specific
 * wedding guest list CSV file created by this application.
 */
export const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

export const DRIVE_CSV_FILENAME = 'Saurabh-Sang-Ranju-Guest-List.csv';

export interface DriveCsvLinkMetadata {
  fileId: string;
  fileName: string;
  viewLink: string;
  directDownloadLink: string;
  lastSyncedAtIso: string;
}

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
for (const scope of SCOPES) {
  provider.addScope(scope);
}
provider.setCustomParameters({ prompt: 'select_account' });

// Strict in-memory token cache (never stored in localStorage or sessionStorage)
let isSigningIn = false;
let cachedAccessToken: string | null = null;

export function initGoogleDriveAuth(
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
): () => void {
  return onAuthStateChanged(auth, (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        onAuthSuccess?.(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        onAuthFailure?.();
      }
    } else {
      cachedAccessToken = null;
      onAuthFailure?.();
    }
  });
}

export async function googleDriveSignIn(): Promise<{ user: User; accessToken: string }> {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Could not obtain a Google Drive access token. Please try signing in again.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } finally {
    isSigningIn = false;
  }
}

export function getCachedDriveAccessToken(): string | null {
  return cachedAccessToken;
}

export async function logoutGoogleDrive(): Promise<void> {
  await auth.signOut();
  cachedAccessToken = null;
}

export function buildDriveShareLinks(fileId: string): {
  viewLink: string;
  directDownloadLink: string;
} {
  const safeId = encodeURIComponent(fileId);
  return {
    viewLink: `https://drive.google.com/file/d/${safeId}/view?usp=sharing`,
    directDownloadLink: `https://drive.google.com/uc?export=download&id=${safeId}`,
  };
}

interface DriveFileApiResponse {
  id: string;
  name?: string;
  webViewLink?: string;
  webContentLink?: string;
}

async function parseDriveError(res: Response): Promise<string> {
  if (res.status === 401) {
    cachedAccessToken = null;
    return 'Google Drive session expired. Please sign in with Google again.';
  }
  try {
    const json = (await res.json()) as { error?: { message?: string } };
    if (json?.error?.message) return json.error.message;
  } catch {
    // fallback
  }
  return `Google Drive request failed (HTTP ${res.status}).`;
}

/**
 * Searches Google Drive (within this app's drive.file scope) for an existing
 * permanent wedding guest list CSV so repeat syncs preserve the same URL.
 */
export async function findExistingDriveCsv(
  accessToken: string
): Promise<{ id: string; name: string; webViewLink?: string } | null> {
  const q = encodeURIComponent(`name='${DRIVE_CSV_FILENAME}' and trashed=false`);
  const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,webViewLink)&pageSize=1`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(await parseDriveError(res));
  }
  const data = (await res.json()) as { files?: Array<{ id: string; name: string; webViewLink?: string }> };
  return data.files && data.files.length > 0 ? data.files[0] : null;
}

async function createPermanentDriveCsv(
  accessToken: string,
  csvContent: string
): Promise<DriveFileApiResponse> {
  const boundary = '----SaurabhRanjuVivahCsvBoundary7f8a9b';
  const metadata = {
    name: DRIVE_CSV_FILENAME,
    mimeType: 'text/csv',
    description: 'Saurabh Sang Ranju Wedding RSVP Guest List (UTF-8 CSV)',
  };

  const multipartBody = [
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    JSON.stringify(metadata),
    `--${boundary}`,
    'Content-Type: text/csv; charset=UTF-8',
    '',
    csvContent,
    `--${boundary}--`,
  ].join('\r\n');

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartBody,
    }
  );

  if (!res.ok) {
    throw new Error(await parseDriveError(res));
  }

  return (await res.json()) as DriveFileApiResponse;
}

async function updateExistingDriveCsv(
  accessToken: string,
  fileId: string,
  csvContent: string
): Promise<DriveFileApiResponse | null> {
  const res = await fetch(
    `https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(
      fileId
    )}?uploadType=media&fields=id,name,webViewLink,webContentLink`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'text/csv; charset=UTF-8',
      },
      body: csvContent,
    }
  );

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(await parseDriveError(res));
  }

  return (await res.json()) as DriveFileApiResponse;
}

async function ensurePublicAnyoneReaderPermission(
  accessToken: string,
  fileId: string
): Promise<void> {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}/permissions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone',
      }),
    }
  );

  if (!res.ok) {
    throw new Error(await parseDriveError(res));
  }
}

/**
 * Creates or updates the permanent CSV file in the host's Google Drive and
 * enables public "Anyone with the link can view" access.
 * Must only be invoked after explicit user confirmation in the UI.
 */
export async function syncPermanentPublicDriveCsv(
  accessToken: string,
  csvContent: string,
  knownFileId?: string | null
): Promise<DriveCsvLinkMetadata> {
  let targetFileId = knownFileId || null;

  if (!targetFileId) {
    const existing = await findExistingDriveCsv(accessToken);
    if (existing?.id) {
      targetFileId = existing.id;
    }
  }

  let fileMeta: DriveFileApiResponse | null = null;
  if (targetFileId) {
    fileMeta = await updateExistingDriveCsv(accessToken, targetFileId, csvContent);
  }

  if (!fileMeta) {
    fileMeta = await createPermanentDriveCsv(accessToken, csvContent);
  }

  await ensurePublicAnyoneReaderPermission(accessToken, fileMeta.id);

  const links = buildDriveShareLinks(fileMeta.id);
  const viewLink =
    fileMeta.webViewLink && fileMeta.webViewLink.startsWith('https://drive.google.com/')
      ? fileMeta.webViewLink
      : links.viewLink;

  return {
    fileId: fileMeta.id,
    fileName: fileMeta.name || DRIVE_CSV_FILENAME,
    viewLink,
    directDownloadLink: links.directDownloadLink,
    lastSyncedAtIso: new Date().toISOString(),
  };
}

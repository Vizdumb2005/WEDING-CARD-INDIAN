import { useCallback, useEffect, useState, type FormEvent } from 'react';
import type { User } from 'firebase/auth';
import {
  DRIVE_CSV_FILENAME,
  getCachedDriveAccessToken,
  googleDriveSignIn,
  initGoogleDriveAuth,
  logoutGoogleDrive,
  syncPermanentPublicDriveCsv,
  type DriveCsvLinkMetadata,
} from '../utils/googleDriveCsv';
import { MadhubaniAripanDivider, MadhubaniCornerFiligree, UiIcon } from './MadhubaniArt';

interface GuestLedgerEntry {
  id: string;
  submittedAtIst: string;
  guestName: string;
  guestContact: string;
  response: string;
  guestCount: number;
  ceremonies: string;
  blessingsNote: string;
}

interface GuestLedgerSummary {
  totalResponses: number;
  acceptingFamilies: number;
  totalConfirmedGuests: number;
  sendingBlessings: number;
}

type AuthMode = 'loading' | 'needs-setup' | 'claimed' | 'env-passcode';

/**
 * Private Host-Only Guest List & Permanent Google Drive CSV Ledger (/host-guest-ledger)
 * -----------------------------------------------------------------------------
 * Never linked or referenced anywhere inside the public wedding invitation.
 * Authenticates against the Express server using an in-memory Bearer session token
 * and connects optionally to the host's Google Drive (drive.file scope) via client-side
 * Firebase Auth with explicit user confirmation before creating or updating the CSV.
 */
export function HostGuestLedger() {
  const [authMode, setAuthMode] = useState<AuthMode>('loading');
  const [token, setToken] = useState<string | null>(null);
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [entries, setEntries] = useState<GuestLedgerEntry[]>([]);
  const [summary, setSummary] = useState<GuestLedgerSummary>({
    totalResponses: 0,
    acceptingFamilies: 0,
    totalConfirmedGuests: 0,
    sendingBlessings: 0,
  });
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState('');

  // Google Drive Auth & Permanent Public CSV State
  const [driveUser, setDriveUser] = useState<User | null>(null);
  const [driveAccessToken, setDriveAccessToken] = useState<string | null>(null);
  const [needsDriveAuth, setNeedsDriveAuth] = useState(true);
  const [isDriveSigningIn, setIsDriveSigningIn] = useState(false);
  const [driveLink, setDriveLink] = useState<DriveCsvLinkMetadata | null>(null);
  const [isSyncingDrive, setIsSyncingDrive] = useState(false);
  const [driveStatus, setDriveStatus] = useState('');
  const [driveError, setDriveError] = useState('');
  const [copiedLinkType, setCopiedLinkType] = useState<'view' | 'download' | null>(null);
  const [showDriveConfirmModal, setShowDriveConfirmModal] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/api/host-ledger/status')
      .then((res) => res.json())
      .then((data: { mode?: AuthMode }) => {
        if (active && data.mode) setAuthMode(data.mode);
      })
      .catch(() => {
        if (active) setAuthMode('claimed');
      });
    return () => {
      active = false;
    };
  }, []);

  // Track Google Drive sign-in state (in-memory token only)
  useEffect(() => {
    const unsubscribe = initGoogleDriveAuth(
      (user, accessToken) => {
        setDriveUser(user);
        setDriveAccessToken(accessToken);
        setNeedsDriveAuth(false);
      },
      () => {
        setDriveUser(null);
        setDriveAccessToken(null);
        setNeedsDriveAuth(true);
      }
    );
    return unsubscribe;
  }, []);

  const fetchLedger = useCallback(async (bearerToken: string) => {
    setLoadingEntries(true);
    try {
      const res = await fetch('/api/host-ledger/rsvps', {
        headers: { Authorization: `Bearer ${bearerToken}` },
      });
      if (res.status === 401) {
        setToken(null);
        setAuthError('Session expired. Please sign in again.');
        return;
      }
      if (!res.ok) throw new Error('Unable to load guest list.');
      const data = (await res.json()) as {
        entries: GuestLedgerEntry[];
        driveLink?: DriveCsvLinkMetadata | null;
        summary: GuestLedgerSummary;
      };
      setEntries(data.entries || []);
      if (data.driveLink) setDriveLink(data.driveLink);
      if (data.summary) setSummary(data.summary);
    } catch {
      setAuthError('Unable to fetch guest responses right now.');
    } finally {
      setLoadingEntries(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchLedger(token);
    }
  }, [token, fetchLedger]);

  const handleAuthSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthError('');

    const trimmed = passcode.trim();
    if (authMode === 'needs-setup') {
      if (trimmed.length < 6) {
        setAuthError('Please choose a host passcode of at least 6 characters.');
        return;
      }
      if (trimmed !== confirmPasscode.trim()) {
        setAuthError('Passcodes do not match.');
        return;
      }
    } else if (!trimmed) {
      setAuthError('Please enter your host passcode.');
      return;
    }

    setSubmitting(true);
    try {
      const endpoint =
        authMode === 'needs-setup' ? '/api/host-ledger/claim' : '/api/host-ledger/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: trimmed }),
      });
      const data = (await res.json()) as { token?: string; error?: string };
      if (!res.ok || !data.token) {
        setAuthError(data.error || 'Authentication failed.');
        return;
      }
      setPasscode('');
      setConfirmPasscode('');
      setAuthMode('claimed');
      setToken(data.token);
    } catch {
      setAuthError('Network error while connecting to the host server.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadCsv = async () => {
    if (!token) return;
    setDownloadStatus('');
    try {
      const res = await fetch('/api/host-ledger/export.csv', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        setToken(null);
        setAuthError('Session expired. Please sign in again.');
        return;
      }
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = DRIVE_CSV_FILENAME;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setDownloadStatus('CSV exported cleanly.');
    } catch {
      setDownloadStatus('Could not export CSV. Please try again.');
    }
  };

  const handleGoogleDriveSignIn = async () => {
    setDriveError('');
    setDriveStatus('');
    setIsDriveSigningIn(true);
    try {
      const result = await googleDriveSignIn();
      setDriveUser(result.user);
      setDriveAccessToken(result.accessToken);
      setNeedsDriveAuth(false);
      setDriveStatus('Connected to Google Drive. Ready to create or update your permanent CSV.');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to sign in with Google Drive right now.';
      setDriveError(message);
    } finally {
      setIsDriveSigningIn(false);
    }
  };

  const handleGoogleDriveSignOut = async () => {
    await logoutGoogleDrive();
    setDriveUser(null);
    setDriveAccessToken(null);
    setNeedsDriveAuth(true);
    setDriveStatus('');
    setDriveError('');
  };

  const handleRequestDriveSync = () => {
    setDriveError('');
    const activeToken = driveAccessToken || getCachedDriveAccessToken();
    if (!activeToken) {
      setNeedsDriveAuth(true);
      setDriveError('Please sign in with Google to sync the permanent CSV file.');
      return;
    }
    setShowDriveConfirmModal(true);
  };

  const handleConfirmDriveSync = async () => {
    setShowDriveConfirmModal(false);
    if (!token) return;

    const activeToken = driveAccessToken || getCachedDriveAccessToken();
    if (!activeToken) {
      setNeedsDriveAuth(true);
      setDriveError('Google Drive session expired. Please sign in with Google again.');
      return;
    }

    setIsSyncingDrive(true);
    setDriveError('');
    setDriveStatus('');

    try {
      // 1. Fetch fresh UTF-8 BOM CSV from our authenticated server endpoint
      const csvRes = await fetch('/api/host-ledger/export.csv', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (csvRes.status === 401) {
        setToken(null);
        setAuthError('Host session expired. Please sign in again.');
        return;
      }
      if (!csvRes.ok) {
        throw new Error('Could not read the guest list CSV from the server.');
      }
      const csvContent = await csvRes.text();

      // 2. Create or update the permanent CSV on Google Drive & enable public anyone-with-link view
      const syncedMeta = await syncPermanentPublicDriveCsv(
        activeToken,
        csvContent,
        driveLink?.fileId || null
      );

      // 3. Persist the permanent Google Drive link metadata on our host ledger server
      const saveRes = await fetch('/api/host-ledger/drive-meta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(syncedMeta),
      });
      if (saveRes.ok) {
        const saved = (await saveRes.json()) as { driveLink?: DriveCsvLinkMetadata };
        setDriveLink(saved.driveLink || syncedMeta);
      } else {
        setDriveLink(syncedMeta);
      }

      setDriveStatus(
        driveLink
          ? 'Permanent Google Drive CSV updated in-place. Your public link remains unchanged.'
          : 'Permanent CSV created on your Google Drive with public link access enabled.'
      );
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Unable to sync guest list CSV to Google Drive.';
      setDriveError(msg);
      if (msg.toLowerCase().includes('session expired')) {
        setNeedsDriveAuth(true);
        setDriveAccessToken(null);
      }
    } finally {
      setIsSyncingDrive(false);
    }
  };

  const handleCopyDriveLink = async (type: 'view' | 'download', url: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      }
      setCopiedLinkType(type);
      window.setTimeout(() => setCopiedLinkType(null), 2400);
    } catch {
      // fallback silently
    }
  };

  const handleSignOut = () => {
    setToken(null);
    setEntries([]);
    setDownloadStatus('');
    setDriveStatus('');
    setDriveError('');
  };

  return (
    <div className="min-h-[100svh] w-full px-4 py-10 sm:py-14 flex items-start justify-center">
      <div className="w-full max-w-[920px] relative papercraft-card rounded-[26px] px-6 sm:px-10 pt-12 pb-12">
        <MadhubaniCornerFiligree position="tl" tone="gold" />
        <MadhubaniCornerFiligree position="tr" tone="gold" />
        <MadhubaniCornerFiligree position="bl" tone="gold" />
        <MadhubaniCornerFiligree position="br" tone="gold" />

        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <p className="font-micro-ui text-[10px] text-[#7A5960]">
              Private Family Registry · Host Only
            </p>
            <h1 className="font-hindi-calligraphy text-[30px] sm:text-[34px] text-[#7A1026] mt-1">
              सौरभ संग रंजू — अतिथि सूची
            </h1>
            <p className="font-english-serif italic text-base text-[#5D3C43] mt-0.5">
              Private RSVP Guest List &amp; Permanent Google Drive CSV
            </p>
            <MadhubaniAripanDivider className="mt-3" tone="gold" />
          </div>

          {!token ? (
            /* Passcode Gate or First-Run Setup */
            <div className="max-w-[420px] mx-auto">
              {authMode === 'loading' ? (
                <p className="text-center font-english-serif italic text-sm text-[#7A5960] py-8">
                  Preparing private registry...
                </p>
              ) : (
                <form onSubmit={handleAuthSubmit} className="space-y-5">
                  <div className="rounded-[16px] bg-[#F5E7E4]/80 border border-[#C69B46]/45 p-4 text-center">
                    <p className="font-hindi-serif text-xs font-semibold text-[#7A1026]">
                      {authMode === 'needs-setup'
                        ? 'First-Time Host Setup · Set Your Private Passcode'
                        : 'Restricted Host Access · पासकोड दर्ज करें'}
                    </p>
                    <p className="font-english-serif text-[13px] text-[#5D3C43] mt-1 leading-snug">
                      {authMode === 'needs-setup'
                        ? 'Create a private passcode (6+ characters) to lock this guest CSV ledger. Only family hosts with this passcode can view, download, or sync responses to Google Drive.'
                        : 'Enter your family host passcode to view confirmed RSVPs, download the CSV, or sync to your permanent Google Drive file.'}
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="host-passcode"
                      className="block font-micro-ui text-[9.5px] text-[#7A5960] mb-2"
                    >
                      {authMode === 'needs-setup' ? 'Choose Host Passcode' : 'Host Passcode'}
                    </label>
                    <input
                      id="host-passcode"
                      type="password"
                      autoComplete={authMode === 'needs-setup' ? 'new-password' : 'current-password'}
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      placeholder="Enter private passcode"
                      className="w-full px-4 py-3.5 rounded-[14px] bg-[#FBF6EE] border border-[#C69B46]/65 text-[#33181E] font-english-serif text-sm"
                    />
                  </div>

                  {authMode === 'needs-setup' && (
                    <div>
                      <label
                        htmlFor="host-passcode-confirm"
                        className="block font-micro-ui text-[9.5px] text-[#7A5960] mb-2"
                      >
                        Confirm Host Passcode
                      </label>
                      <input
                        id="host-passcode-confirm"
                        type="password"
                        autoComplete="new-password"
                        value={confirmPasscode}
                        onChange={(e) => setConfirmPasscode(e.target.value)}
                        placeholder="Re-enter private passcode"
                        className="w-full px-4 py-3.5 rounded-[14px] bg-[#FBF6EE] border border-[#C69B46]/65 text-[#33181E] font-english-serif text-sm"
                      />
                    </div>
                  )}

                  {authError && (
                    <p role="alert" className="text-center font-english-serif text-sm text-[#9E162E]">
                      {authError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 px-6 rounded-full bg-[#7A1026] text-[#FBF6EE] border border-[#C69B46]/85 font-micro-ui text-[10.5px] font-semibold hover:bg-[#5E0C1D] transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {submitting
                      ? 'Verifying...'
                      : authMode === 'needs-setup'
                        ? 'Save Passcode & Open Guest List'
                        : 'Unlock Guest List'}
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* Authenticated Host Guest List Dashboard */
            <div className="space-y-6">
              {/* Summary Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Total RSVPs', value: summary.totalResponses },
                  { label: 'Confirmed Guests', value: summary.totalConfirmedGuests },
                  { label: 'Accepting Families', value: summary.acceptingFamilies },
                  { label: 'Blessings Only', value: summary.sendingBlessings },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-[16px] bg-[#F5E7E4]/80 border border-[#C69B46]/45 px-4 py-3.5 text-center"
                  >
                    <p className="font-royal-caps text-[26px] font-semibold text-[#7A1026] leading-tight tabular-nums">
                      {stat.value}
                    </p>
                    <p className="font-micro-ui text-[8.5px] text-[#7A5960] mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Permanent Google Drive Public CSV Panel */}
              <div
                data-testid="google-drive-csv-panel"
                className="rounded-[18px] bg-[#F5E7E4]/65 border border-[#C69B46]/55 p-5 space-y-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-micro-ui text-[9px] text-[#966B22] font-semibold">
                      Permanent Google Drive CSV · Public Link Access
                    </p>
                    <h2 className="font-english-serif text-[20px] font-semibold text-[#7A1026] mt-0.5">
                      {DRIVE_CSV_FILENAME}
                    </h2>
                    <p className="font-english-serif text-[13px] text-[#5D3C43] mt-0.5">
                      Save a permanent copy of your guest list CSV on your Google Drive with
                      anyone-with-link access. Re-syncing updates the same file without changing its
                      link.
                    </p>
                  </div>

                  {driveUser && !needsDriveAuth && (
                    <div className="flex items-center gap-2.5 text-right">
                      <span className="font-english-serif text-xs text-[#5D3C43]">
                        {driveUser.email}
                      </span>
                      <button
                        type="button"
                        onClick={handleGoogleDriveSignOut}
                        className="px-3 py-1.5 rounded-full bg-[#FBF6EE] border border-[#C69B46]/60 text-[#7A1026] font-micro-ui text-[8.5px] font-semibold hover:bg-[#EDD4D7] cursor-pointer"
                      >
                        Sign Out Drive
                      </button>
                    </div>
                  )}
                </div>

                {/* Official Styled Sign in with Google Button OR Sync Controls */}
                <div className="flex flex-wrap items-center gap-3">
                  {needsDriveAuth ? (
                    <button
                      type="button"
                      onClick={handleGoogleDriveSignIn}
                      disabled={isDriveSigningIn}
                      className="gsi-material-button inline-flex items-center gap-3 px-4 py-2.5 rounded-[4px] bg-white border border-[#747775] text-[#1F1F1F] text-[14px] font-medium shadow-sm hover:bg-[#F8FAFD] hover:shadow transition-all cursor-pointer disabled:opacity-60"
                    >
                      <span className="w-[18px] h-[18px] flex items-center justify-center shrink-0">
                        <svg
                          version="1.1"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 48 48"
                          className="w-[18px] h-[18px] block"
                          aria-hidden="true"
                        >
                          <path
                            fill="#EA4335"
                            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                          />
                          <path
                            fill="#4285F4"
                            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                          />
                          <path
                            fill="#34A853"
                            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                          />
                          <path fill="none" d="M0 0h48v48H0z" />
                        </svg>
                      </span>
                      <span>
                        {isDriveSigningIn ? 'Connecting Google Drive...' : 'Sign in with Google'}
                      </span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRequestDriveSync}
                      disabled={isSyncingDrive}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#7A1026] text-[#FBF6EE] border border-[#C69B46]/85 font-micro-ui text-[9.5px] font-semibold hover:bg-[#5E0C1D] transition-colors cursor-pointer disabled:opacity-60"
                    >
                      <UiIcon name="check" className="w-3.5 h-3.5" />
                      <span>
                        {isSyncingDrive
                          ? 'Syncing to Google Drive...'
                          : driveLink
                            ? 'Sync Latest RSVPs to Permanent Drive CSV'
                            : 'Create Permanent Public CSV on Google Drive'}
                      </span>
                    </button>
                  )}
                </div>

                {driveStatus && (
                  <p className="font-english-serif italic text-xs text-[#5D7A5B]">{driveStatus}</p>
                )}
                {driveError && (
                  <p role="alert" className="font-english-serif text-xs text-[#9E162E]">
                    {driveError}
                  </p>
                )}

                {/* Saved Permanent Public Google Drive Link Box */}
                {driveLink && (
                  <div className="rounded-[14px] bg-[#FBF6EE] border border-[#C69B46]/55 p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-micro-ui text-[9px] text-[#5D7A5B] font-semibold">
                        Permanent Public CSV Link Active
                      </p>
                      <span className="font-english-serif text-xs text-[#7A5960]">
                        Last synced:{' '}
                        {new Date(driveLink.lastSyncedAtIso).toLocaleString('en-IN', {
                          timeZone: 'Asia/Kolkata',
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}{' '}
                        IST
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        aria-label="Permanent Google Drive CSV Link"
                        value={driveLink.viewLink}
                        className="flex-1 px-3.5 py-2.5 rounded-[10px] bg-[#F5E7E4]/60 border border-[#C69B46]/45 text-xs text-[#33181E] font-mono"
                      />
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopyDriveLink('view', driveLink.viewLink)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-[#7A1026] text-[#FBF6EE] font-micro-ui text-[9px] font-semibold hover:bg-[#5E0C1D] cursor-pointer"
                        >
                          <UiIcon
                            name={copiedLinkType === 'view' ? 'check' : 'copy'}
                            className="w-3.5 h-3.5"
                          />
                          <span>{copiedLinkType === 'view' ? 'Copied' : 'Copy Link'}</span>
                        </button>
                        <a
                          href={driveLink.viewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-[#FBF6EE] border border-[#C69B46]/70 text-[#7A1026] font-micro-ui text-[9px] font-semibold hover:bg-[#F5E7E4]"
                        >
                          <span>Open Drive</span>
                        </a>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#C69B46]/25">
                      <span className="font-english-serif text-xs text-[#5D3C43] break-all">
                        Direct CSV download:{' '}
                        <a
                          href={driveLink.directDownloadLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline text-[#7A1026]"
                        >
                          {driveLink.directDownloadLink}
                        </a>
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyDriveLink('download', driveLink.directDownloadLink)
                        }
                        className="font-micro-ui text-[8.5px] text-[#7A1026] underline cursor-pointer"
                      >
                        {copiedLinkType === 'download' ? 'Copied Download Link' : 'Copy Download Link'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleDownloadCsv}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#7A1026] text-[#FBF6EE] border border-[#C69B46]/85 font-micro-ui text-[10px] font-semibold hover:bg-[#5E0C1D] transition-colors cursor-pointer"
                  >
                    <UiIcon name="down" className="w-3.5 h-3.5" />
                    <span>Download CSV Guest List</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fetchLedger(token)}
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-[#FBF6EE] border border-[#C69B46]/65 text-[#7A1026] font-micro-ui text-[9.5px] font-semibold hover:bg-[#F5E7E4] transition-colors cursor-pointer"
                  >
                    <UiIcon name="replay" className="w-3.5 h-3.5" />
                    <span>Refresh</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="px-4 py-2.5 rounded-full bg-transparent border border-[#7A1026]/40 text-[#7A1026] font-micro-ui text-[9px] font-semibold hover:bg-[#F5E7E4] transition-colors cursor-pointer"
                >
                  Lock Registry
                </button>
              </div>

              {downloadStatus && (
                <p className="font-english-serif italic text-xs text-[#5D7A5B]">{downloadStatus}</p>
              )}

              {/* Guest Table */}
              <div className="overflow-x-auto rounded-[18px] border border-[#C69B46]/45 bg-[#FBF6EE]">
                {loadingEntries ? (
                  <p className="p-8 text-center font-english-serif italic text-sm text-[#7A5960]">
                    Loading guest responses...
                  </p>
                ) : entries.length === 0 ? (
                  <p className="p-8 text-center font-hindi-serif text-sm text-[#7A5960]">
                    अभी कोई अतिथि प्रतिक्रिया दर्ज नहीं हुई है। No guest RSVPs recorded yet.
                  </p>
                ) : (
                  <table className="w-full text-left border-collapse min-w-[640px]">
                    <thead>
                      <tr className="bg-[#F5E7E4] border-b border-[#C69B46]/45">
                        <th className="px-4 py-3 font-micro-ui text-[8.5px] text-[#7A1026]">
                          Guest Name
                        </th>
                        <th className="px-4 py-3 font-micro-ui text-[8.5px] text-[#7A1026]">
                          Phone / City
                        </th>
                        <th className="px-4 py-3 font-micro-ui text-[8.5px] text-[#7A1026]">
                          Response
                        </th>
                        <th className="px-4 py-3 font-micro-ui text-[8.5px] text-[#7A1026]">
                          Guests
                        </th>
                        <th className="px-4 py-3 font-micro-ui text-[8.5px] text-[#7A1026]">
                          Ceremonies &amp; Blessings
                        </th>
                        <th className="px-4 py-3 font-micro-ui text-[8.5px] text-[#7A1026]">
                          Submitted (IST)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#C69B46]/25">
                      {entries.map((entry) => (
                        <tr key={entry.id} className="hover:bg-[#F5E7E4]/40 transition-colors">
                          <td className="px-4 py-3 font-hindi-serif text-[13px] font-semibold text-[#33181E]">
                            {entry.guestName}
                          </td>
                          <td className="px-4 py-3 font-hindi-serif text-xs text-[#5D3C43]">
                            {entry.guestContact}
                          </td>
                          <td className="px-4 py-3 font-hindi-serif text-xs text-[#7A1026] font-medium">
                            {entry.response}
                          </td>
                          <td className="px-4 py-3 font-royal-caps text-sm font-semibold text-[#33181E] tabular-nums">
                            {entry.guestCount}
                          </td>
                          <td className="px-4 py-3 font-hindi-serif text-xs text-[#33181E] max-w-[260px]">
                            <p>{entry.ceremonies}</p>
                            {entry.blessingsNote && entry.blessingsNote !== '-' && (
                              <p className="text-[#7A5960] italic mt-1">“{entry.blessingsNote}”</p>
                            )}
                          </td>
                          <td className="px-4 py-3 font-english-serif text-xs text-[#7A5960] whitespace-nowrap">
                            {entry.submittedAtIst}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Explicit Confirmation Modal before Mutating Google Drive File or Sharing Permissions */}
      {showDriveConfirmModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="drive-confirm-title"
          className="fixed inset-0 z-50 bg-[#2A050D]/75 backdrop-blur-[2px] flex items-center justify-center p-4"
        >
          <div className="w-full max-w-[460px] rounded-[22px] papercraft-card px-6 py-7 space-y-5 relative">
            <MadhubaniCornerFiligree position="tl" tone="gold" />
            <MadhubaniCornerFiligree position="br" tone="gold" />

            <div className="relative z-10 space-y-3">
              <p className="font-micro-ui text-[9px] text-[#966B22] font-semibold">
                Confirm Google Drive Action
              </p>
              <h3
                id="drive-confirm-title"
                className="font-english-serif text-[22px] font-semibold text-[#7A1026]"
              >
                {driveLink
                  ? 'Update Permanent Guest List CSV?'
                  : 'Create Public CSV on Google Drive?'}
              </h3>
              <p className="font-english-serif text-sm text-[#33181E] leading-relaxed">
                {driveLink
                  ? `This will overwrite "${DRIVE_CSV_FILENAME}" on your Google Drive with the latest ${summary.totalResponses} RSVP record(s) while keeping your existing permanent share link active.`
                  : `This will create "${DRIVE_CSV_FILENAME}" with ${summary.totalResponses} RSVP record(s) in your Google Drive and set its sharing permission to "Anyone with the link can view" so you can share or open it directly.`}
              </p>

              <div className="flex flex-wrap items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowDriveConfirmModal(false)}
                  className="px-5 py-2.5 rounded-full bg-[#FBF6EE] border border-[#C69B46]/65 text-[#5D3C43] font-micro-ui text-[9.5px] font-semibold hover:bg-[#F5E7E4] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDriveSync}
                  className="px-5 py-2.5 rounded-full bg-[#7A1026] text-[#FBF6EE] border border-[#C69B46]/85 font-micro-ui text-[9.5px] font-semibold hover:bg-[#5E0C1D] cursor-pointer"
                >
                  {driveLink ? 'Confirm & Update CSV' : 'Confirm & Create Public CSV'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

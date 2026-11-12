import { AlertCircle, KeyRound, RefreshCw, ShieldCheck } from 'lucide-react';

// The state of the connection, printed before any project is read. Credentials are held as
// app secrets and never touch this screen: the plate names them, says where they are set,
// and offers one key to test what the server can see.
export default function BasecampConnectionPlate({ status, testing, onTest }) {
  const configured = status?.configured;
  const failed = status?.state === 'error';

  return (
    <div className="desk-plate px-3.5 py-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <span
            className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded"
            style={{ border: '1px solid rgba(201,168,124,0.34)' }}
          >
            {failed ? (
              <AlertCircle className="h-3.5 w-3.5 text-red-300" />
            ) : configured ? (
              <ShieldCheck className="h-3.5 w-3.5 text-editorial-gold" />
            ) : (
              <KeyRound className="h-3.5 w-3.5 text-editorial-gold" />
            )}
          </span>

          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-editorial-cream">
              {failed
                ? 'Basecamp could not be reached'
                : configured
                  ? `Connected to Basecamp account ${status.account || '—'}`
                  : 'Basecamp is not connected yet'}
            </p>
            <p className="mt-0.5 max-w-2xl text-[11px] leading-relaxed text-editorial-cream/60">
              {failed
                ? status.error || 'The account did not answer. Check the access token, then test again.'
                : configured
                  ? 'Every project this account can reach is listed below. Reads and writes run on the server; the token is never sent to the browser.'
                  : 'Two secrets carry the connection: BASECAMP_ACCOUNT_ID and BASECAMP_ACCESS_TOKEN. Add them on Dashboard → Secrets, then test the connection here.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onTest}
          disabled={testing}
          className="desk-key desk-key-row"
        >
          <RefreshCw className={`h-3 w-3 ${testing ? 'animate-spin' : ''}`} />
          {testing ? 'Testing' : 'Test connection'}
        </button>
      </div>
    </div>
  );
}
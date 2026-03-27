import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, serverUrl, token, functionsVersion } = appParams;

// Debug logging for production
if (typeof window !== 'undefined') {
  console.log('[Base44] App Params:', {
    appId: appId ? '✓' : '✗ MISSING',
    serverUrl: serverUrl ? `✓ (${serverUrl})` : '✗ MISSING',
    token: token ? '✓' : '✗ MISSING',
    functionsVersion: functionsVersion || '(default)',
    envAppId: import.meta.env.VITE_BASE44_APP_ID ? '✓' : '✗',
    envBackend: import.meta.env.VITE_BASE44_BACKEND_URL ? '✓' : '✗'
  });
}

//Create a client with authentication required
export const base44 = createClient({
  appId,
  serverUrl,
  token,
  functionsVersion,
  requiresAuth: false
});
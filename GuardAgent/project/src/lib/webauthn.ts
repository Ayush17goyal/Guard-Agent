// Real WebAuthn / passkey authentication using the browser's PublicKeyCredential API.
// Falls back gracefully when unsupported.

export function webAuthnSupported(): boolean {
  return typeof window !== 'undefined'
    && typeof window.PublicKeyCredential !== 'undefined'
    && typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function';
}

export async function platformAuthenticatorAvailable(): Promise<boolean> {
  if (!webAuthnSupported()) return false;
  try {
    return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

function bufToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function base64ToBuf(b64: string): ArrayBuffer {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

export interface WebAuthnResult {
  success: boolean;
  credentialId?: string;
  error?: string;
}

// Registration + authentication in one flow.
// We register a new passkey then immediately authenticate with it,
// so the user sees a real biometric prompt without pre-existing credentials.
export async function performWebAuthn(): Promise<WebAuthnResult> {
  if (!webAuthnSupported()) {
    return { success: false, error: 'WebAuthn is not supported in this browser.' };
  }

  const supported = await platformAuthenticatorAvailable();
  if (!supported) {
    return { success: false, error: 'No biometric platform authenticator available on this device.' };
  }

  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const userId = crypto.getRandomValues(new Uint8Array(16));

    const registrationOptions: CredentialCreationOptions = {
      publicKey: {
        challenge: challenge.buffer as ArrayBuffer,
        rp: { name: 'GuardAgent' },
        user: {
          id: userId.buffer as ArrayBuffer,
          name: 'security-operator@guardagent',
          displayName: 'Security Operator',
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 },
          { type: 'public-key', alg: -257 },
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          residentKey: 'preferred',
        },
        timeout: 60000,
        attestation: 'none',
      },
    };

    const credential = await navigator.credentials.create(registrationOptions) as PublicKeyCredential | null;
    if (!credential) {
      return { success: false, error: 'Authentication was cancelled.' };
    }

    const credentialId = bufToBase64(credential.rawId);

    // Immediately authenticate (get assertion) to prove the credential works
    const assertionChallenge = crypto.getRandomValues(new Uint8Array(32));
    const assertionOptions: CredentialRequestOptions = {
      publicKey: {
        challenge: assertionChallenge.buffer as ArrayBuffer,
        userVerification: 'required',
        timeout: 60000,
      },
    };

    const assertion = await navigator.credentials.get(assertionOptions) as PublicKeyCredential | null;
    if (!assertion) {
      return { success: false, error: 'Authentication was cancelled.' };
    }

    return { success: true, credentialId };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Authentication failed.';
    if (msg.includes('cancel') || msg.includes('abort') || msg.includes('NotAllowed')) {
      return { success: false, error: 'Authentication was cancelled.' };
    }
    if (msg.includes('timeout') || msg.toLowerCase().includes('timed out')) {
      return { success: false, error: 'Authentication timed out.' };
    }
    return { success: false, error: msg };
  }
}

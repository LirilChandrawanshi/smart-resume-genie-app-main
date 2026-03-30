/**
 * Encode / decode resume data for share links (?d=...).
 * Uses base64url so the payload survives query strings.
 */

export type SharePayloadV1 = {
  v: 1;
  template: string;
  data: Record<string, unknown>;
};

const MAX_ENCODED_LENGTH = 48_000;

export function encodeSharePayload(payload: SharePayloadV1): string {
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeSharePayload(encoded: string): SharePayloadV1 | null {
  try {
    let b64 = encoded.trim().replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4;
    if (pad) b64 += '===='.slice(0, 4 - pad);
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const json = new TextDecoder().decode(bytes);
    const o = JSON.parse(json) as SharePayloadV1;
    if (o?.v !== 1 || !o.data || typeof o.data !== 'object') return null;
    return o;
  } catch {
    return null;
  }
}

export function isSharePayloadTooLarge(encoded: string): boolean {
  return encoded.length > MAX_ENCODED_LENGTH;
}

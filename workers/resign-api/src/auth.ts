/**
 * Verify Firebase ID token via Google's JWK endpoint (RS256).
 * Returns the decoded uid on success, throws on failure.
 *
 * Uses JWK keys (not X.509 certs) to avoid SPKI extraction complexity.
 */
export async function verifyFirebaseToken(
  token: string,
  projectId: string
): Promise<string> {
  // Decode header to find the key id
  const [headerB64, payloadB64, signatureB64] = token.split('.')
  if (!headerB64 || !payloadB64 || !signatureB64) throw new Error('Invalid token format')

  const header = JSON.parse(b64urlDecode(headerB64))
  if (header.alg !== 'RS256') throw new Error('Unexpected algorithm: ' + header.alg)

  // Fetch Google's JWK public keys
  const jwksRes = await fetch(
    'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'
  )
  if (!jwksRes.ok) throw new Error('Failed to fetch Firebase JWK keys')
  const { keys }: { keys: JsonWebKey[] } = await jwksRes.json()

  const jwk = keys.find((k: any) => k.kid === header.kid)
  if (!jwk) throw new Error('Unknown key id: ' + header.kid)

  // Import the JWK public key directly — no PEM/DER conversion needed
  const pubKey = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify']
  )

  // Verify signature
  const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`)
  const sig  = b64urlToBuffer(signatureB64)
  const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', pubKey, sig, data)
  if (!valid) throw new Error('Invalid token signature')

  // Verify claims
  const payload = JSON.parse(b64urlDecode(payloadB64))
  const now = Math.floor(Date.now() / 1000)

  if (payload.exp < now)                throw new Error('Token expired')
  if (payload.iat > now + 300)          throw new Error('Token issued in the future')
  if (payload.aud !== projectId)        throw new Error('Token audience mismatch')
  if (payload.iss !== `https://securetoken.google.com/${projectId}`) throw new Error('Token issuer mismatch')

  return payload.sub as string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function b64urlDecode(str: string): string {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/')
  return atob(b64.padEnd(str.length + ((4 - str.length % 4) % 4), '='))
}

function b64urlToBuffer(str: string): ArrayBuffer {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const padded = b64.padEnd(b64.length + ((4 - b64.length % 4) % 4), '=')
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}

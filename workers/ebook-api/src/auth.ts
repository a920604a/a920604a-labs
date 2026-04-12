/**
 * Verify Firebase ID token via Google's public key endpoint.
 * Returns the decoded uid on success, throws on failure.
 */
export async function verifyFirebaseToken(
  token: string,
  projectId: string
): Promise<string> {
  // Fetch Google's public keys
  const keysRes = await fetch(
    'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com'
  )
  if (!keysRes.ok) throw new Error('Failed to fetch Firebase public keys')
  const keys: Record<string, string> = await keysRes.json()

  // Decode header to find the key id
  const [headerB64, payloadB64, signatureB64] = token.split('.')
  if (!headerB64 || !payloadB64 || !signatureB64) throw new Error('Invalid token format')

  const header = JSON.parse(atob(headerB64.replace(/-/g, '+').replace(/_/g, '/')))
  const certPem = keys[header.kid]
  if (!certPem) throw new Error('Unknown key id')

  // Import the public key
  const certDer = pemToDer(certPem)
  const pubKey = await crypto.subtle.importKey(
    'spki',
    certDer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify']
  )

  // Verify signature
  const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`)
  const sig = base64UrlDecode(signatureB64)
  const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', pubKey, sig, data)
  if (!valid) throw new Error('Invalid token signature')

  // Verify claims
  const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')))
  const now = Math.floor(Date.now() / 1000)

  if (payload.exp < now) throw new Error('Token expired')
  if (payload.iat > now + 300) throw new Error('Token issued in the future')
  if (payload.aud !== projectId) throw new Error('Token audience mismatch')
  if (payload.iss !== `https://securetoken.google.com/${projectId}`) throw new Error('Token issuer mismatch')

  return payload.sub as string
}

function pemToDer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN CERTIFICATE-----/, '')
    .replace(/-----END CERTIFICATE-----/, '')
    .replace(/\n/g, '')
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}

function base64UrlDecode(str: string): ArrayBuffer {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/').padEnd(str.length + ((4 - str.length % 4) % 4), '=')
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}

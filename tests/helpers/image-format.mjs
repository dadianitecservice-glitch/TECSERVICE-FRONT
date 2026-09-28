import assert from 'node:assert/strict'
import { extname } from 'node:path'

// Inspect bytes independently of the production metadata helper. A JPEG can
// render in browsers under a .png URL but still fail a sharing crawler's checks.
export function assertImageFormat(pathname, bytes) {
  let detected
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) detected = 'image/jpeg'
  else if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) detected = 'image/png'
  else if (bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') detected = 'image/webp'
  const expected = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' }[extname(pathname).toLowerCase()]
  assert.ok(expected, `${pathname}: unsupported sharing image extension`)
  assert.ok(detected, `${pathname}: unrecognized image bytes`)
  assert.equal(detected, expected, `${pathname}: the extension must match the image bytes`)
  return detected
}

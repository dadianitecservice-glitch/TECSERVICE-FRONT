// Sharing assets must actually use the format advertised by their URL.
// The asset tests verify the file signatures; this shared mapping keeps the
// initial HTML and hydrated metadata consistent with static-server MIME types.
export function getImageMimeType(url: string): string {
  const extension = url.split(/[?#]/, 1)[0].split('.').pop()?.toLowerCase()
  switch (extension) {
    case 'jpg':
    case 'jpeg': return 'image/jpeg'
    case 'png': return 'image/png'
    case 'webp': return 'image/webp'
    case 'gif': return 'image/gif'
    case 'avif': return 'image/avif'
    default: throw new Error(`Unsupported sharing image format: ${extension}`)
  }
}

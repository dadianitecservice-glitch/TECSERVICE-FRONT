/** Only catalog-provided public image URLs are rendered; never infer from names. */
export function getProductImageUrl(value?: string | null): string | null {
  if (typeof value !== 'string' || value.length > 1000) return null
  const source = value.trim()
  if (!source || /[\s\\<>"'\u0000-\u001f\u007f]/u.test(source)) return null
  if (source.startsWith('/')) {
    return /^\/assets\/products\/(?:[a-z0-9_-]+\/)*[a-z0-9_-]+\.(?:avif|gif|jpe?g|png|webp)$/i.test(source) ? source : null
  }
  if (!/^https?:\/\//i.test(source)) return null
  try {
    const url = new URL(source)
    const authority = source.slice(source.indexOf('//') + 2).split(/[/?#]/, 1)[0]
    if (!/^[a-z0-9.:[\]-]+$/i.test(authority)) return null
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || source.includes('#')) return null
    if (url.port && !['80', '443'].includes(url.port)) return null
    const host = url.hostname.toLowerCase().replace(/\.+$/, '')
    const labels = host.split('.')
    // Reject all IP literals, including URL-normalized decimal/hex/octal forms.
    if (labels.length < 2 || labels.some(label => !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label))) return null
    if (/^(?:0x[0-9a-f]+|[0-9]+)$/i.test(labels[labels.length - 1])) return null
    if (['localhost', 'local', 'localdomain', 'internal', 'lan', 'home', 'home.arpa'].some(suffix => host === suffix || host.endsWith(`.${suffix}`))) return null
    // Hostnames are checked syntactically only; never resolve DNS or fetch here.
    return url.href
  } catch {
    return null
  }
}

export function getArticleShareLinks(url: string, title: string) {
  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  }
}

export async function copyArticleLink(url: string, clipboard?: Pick<Clipboard, 'writeText'>): Promise<boolean> {
  try {
    if (!clipboard) return false
    await clipboard.writeText(url)
    return true
  } catch {
    return false
  }
}

export async function shareArticle(url: string, title: string, navigatorLike?: { share?: (data: ShareData) => Promise<void> }): Promise<'shared' | 'cancelled' | 'unavailable' | 'failed'> {
  if (!navigatorLike?.share) return 'unavailable'
  try {
    await navigatorLike.share({ title, url })
    return 'shared'
  } catch (error) {
    return error instanceof Error && error.name === 'AbortError' ? 'cancelled' : 'failed'
  }
}

import type { BlogPost } from '../data/blogPosts.ts'

/** Georgian noun endings vary in titles; allow a simple final-vowel variant. */
export function matchesBlogQuery(post: BlogPost, query: string): boolean {
  const normalize = (text: string) => text.normalize('NFC').toLowerCase()
  const text = normalize([post.title, post.excerpt, post.category, post.takeaway,
    ...post.sections.flatMap(section => [section.title, ...section.paragraphs, ...(section.bullets ?? [])]),
  ].join(' '))
  return normalize(query).trim().split(/\s+/).filter(Boolean).every(term => {
    if (text.includes(term)) return true
    return /^[\u10d0-\u10ff]{4,}[აი]$/u.test(term) && text.includes(term.slice(0, -1))
  })
}

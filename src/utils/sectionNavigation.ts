type SectionPosition = { id: string; top: number }

/** The most recent heading to pass the reading line below the sticky header. */
export function getActiveSectionId(sections: readonly SectionPosition[], activationTop: number, atPageEnd = false): string {
  if (!sections.length) return ''
  if (atPageEnd) return sections[sections.length - 1].id
  let activeId = sections[0].id
  for (const section of sections) {
    if (section.top > activationTop) break
    activeId = section.id
  }
  return activeId
}

import { useTranslation } from '../i18n/LocaleProvider'
import type { ReactNode } from 'react'

type SectionHeaderProps = {
  title: string
  headingId?: string
  description?: string
  eyebrow?: string
  actions?: ReactNode
  compact?: boolean
}

export function SectionHeader({ title, headingId, description, eyebrow, actions, compact = false }: SectionHeaderProps) {
  const l10n = useTranslation()
  return (
    <div className={`section-header${compact ? ' section-header--compact' : ''}`}>
      <div className="section-header__copy">
        {l10n.t(eyebrow ? <p className="section-eyebrow">{l10n.t(eyebrow)}</p> : null)}
        <h2 id={headingId}>{l10n.t(title)}</h2>
        {l10n.t(description ? <p>{l10n.t(description)}</p> : null)}
      </div>
      {l10n.t(actions ? <div className="section-header__actions">{l10n.t(actions)}</div> : null)}
    </div>
  )
}

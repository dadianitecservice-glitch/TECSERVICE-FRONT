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
  return (
    <div className={`section-header${compact ? ' section-header--compact' : ''}`}>
      <div className="section-header__copy">
        {eyebrow ? <p className="section-eyebrow">{eyebrow}</p> : null}
        <h2 id={headingId}>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? <div className="section-header__actions">{actions}</div> : null}
    </div>
  )
}

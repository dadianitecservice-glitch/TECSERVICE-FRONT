export type TicketMilestoneStep = {
  id: string
  label: string
  state: 'complete' | 'current' | 'upcoming'
  helperText?: string
}

type TicketMilestonesProps = {
  milestones: readonly TicketMilestoneStep[]
  locale?: 'ka' | 'en'
  label?: string
}

const stepCopy = {
  ka: { label: 'სერვისის ეტაპები', complete: 'დასრულებული ეტაპი', current: 'მიმდინარე ეტაპი', upcoming: 'ჯერ დაუდასტურებელი ეტაპი', helper: 'მიმდინარე' },
  en: { label: 'Service progress', complete: 'Completed step', current: 'Current step', upcoming: 'Step not yet confirmed', helper: 'Current' },
}

/** Shared presentation only: callers supply truthful, already-localized steps. */
export function TicketMilestones({ milestones, locale = 'ka', label }: TicketMilestonesProps) {
  const copy = stepCopy[locale]
  return <ol className="milestones" aria-label={label ?? copy.label}>
    {milestones.map((milestone, index) => <li
      key={milestone.id}
      className={`${milestone.state === 'complete' ? 'is-complete' : ''}${milestone.state === 'current' ? ' is-current' : ''}`}
      aria-current={milestone.state === 'current' ? 'step' : undefined}
      aria-label={`${milestone.label} — ${copy[milestone.state]}${milestone.state === 'current' && milestone.helperText ? `. ${milestone.helperText}` : ''}`}
    >
      <span className="milestone-marker" aria-hidden="true">
        {milestone.state === 'complete' ? <img src="/assets/icons/check-white.svg" alt="" /> : null}
      </span>
      <span>{milestone.label}</span>
      {milestone.state === 'current' ? <small>{milestone.helperText || copy.helper}</small> : null}
      {index < milestones.length - 1 ? <i aria-hidden="true" /> : null}
    </li>)}
  </ol>
}

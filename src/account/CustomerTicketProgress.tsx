import { TicketMilestones } from '../components/TicketMilestones'
import { getCustomerServiceProgress } from './serviceProgress'

export type CustomerTicketProgressProps = {
  status: string
  locale: 'ka' | 'en'
  resolution?: string | null
}

export function CustomerTicketProgress({ status, locale, resolution }: CustomerTicketProgressProps) {
  const progress = getCustomerServiceProgress(status, locale, resolution)
  return <div className="account-service-progress" data-status={status} data-known-status={progress.known}>
    <TicketMilestones milestones={progress.milestones} locale={locale} />
    <div className="status-summary">
      <strong>{progress.summary.title}</strong>
      <span>{progress.summary.description}</span>
      {progress.summary.note && <small>{progress.summary.note}</small>}
    </div>
  </div>
}

export default CustomerTicketProgress

import type { ReactNode } from 'react'
import { LaptopIcon } from '../components/LaptopIcon'
import { CustomerTicketProgress } from './CustomerTicketProgress'
import { InvoiceButton } from './InvoiceButton'
import { accountDate, accountDateTime, accountMoney } from './accountFormat'
import { toGeorgianMtavruli } from '../utils/text'
import type { DashboardCopy } from './dashboardCopy'
import type { CustomerTicket } from './types'
import '../styles/account-service-card.css'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div className="account-field"><dt>{label}</dt><dd>{children}</dd></div>
}

function ServiceStatus({ status, copy }: { status: string; copy: DashboardCopy }) {
  const tone = ['ready', 'picked_up'].includes(status) ? 'success' : status === 'waiting_for_part' ? 'waiting' : status === 'could_not_fix' ? 'muted' : 'blue'
  return <span className={`account-status account-status--${tone}`}><span aria-hidden="true" />{(Object.hasOwn(copy.statusLabels, status) ? copy.statusLabels[status] : status) || copy.missing}</span>
}

export function CustomerServiceCard({ ticket, copy, locale, compact = false, isPreview = false }: { ticket: CustomerTicket; copy: DashboardCopy; locale: 'ka' | 'en'; compact?: boolean; isPreview?: boolean }) {
  const Heading = compact ? 'h4' : 'h3'
  const DetailHeading = compact ? 'h5' : 'h4'
  const reference = ticket.ticket_code === null ? copy.noCode : `${copy.service} #${ticket.ticket_code}`
  const deviceLabel = (value: string) => Object.hasOwn(copy.deviceLabels, value) ? copy.deviceLabels[value] : value
  const device = ticket.device ? deviceLabel(ticket.device) : copy.missing
  // The CRM's freeform device field contains the model; category keys are not models.
  const model = ticket.device && !Object.hasOwn(copy.deviceLabels, ticket.device) ? ticket.device : copy.missing
  const dateTime = Number.isNaN(Date.parse(ticket.created_at)) ? undefined : ticket.created_at
  return <article className="account-service-card">
    <details className={`account-service-disclosure${ticket.ticket_code !== null ? ' has-invoice' : ''}`}>
      <summary aria-label={`${reference} — ${copy.details}`}>
        <span className="account-service-summary__header">
          <span className="account-service-summary__reference">{reference}</span>
          <span className="account-service-summary__toggle"><span>{locale === 'ka' ? 'დეტალები' : 'Details'}</span><LaptopIcon name="chevron" /></span>
        </span>
        <span className="account-service-summary__device">
          <span className="account-service-summary__icon"><LaptopIcon name="tool" /></span>
          <span className="account-service-summary__identity">
            <Heading>{device}</Heading>
            {model === copy.missing && <span className="account-sr-only">{copy.model}: {model}</span>}
            <ServiceStatus status={ticket.status} copy={copy} />
          </span>
        </span>
        <span className="account-service-summary__footer">
          <span className="account-service-summary__date"><span>{locale === 'ka' ? 'გაფორმება:' : 'Registered:'}</span><time dateTime={dateTime}>{accountDateTime(ticket.created_at)}</time></span>
          <span className="account-service-summary__amount"><small>{copy.price}</small><strong className="account-service-summary__price">{accountMoney(ticket.cost_estimate, locale)}</strong></span>
        </span>
      </summary>
      <div className="account-service-expanded">
        {ticket.ticket_code !== null && <div className="account-service-invoice"><InvoiceButton target={{ kind: 'service', id: ticket.ticket_code, reference }} locale={locale} isPreview={isPreview} /></div>}
        <div className="account-service-expanded__heading">
          <DetailHeading>{toGeorgianMtavruli(copy.serviceDetails)}</DetailHeading>
          <button type="button" className="account-service-collapse" onClick={event => {
            const disclosure = event.currentTarget.closest('details')
            if (disclosure) {
              disclosure.open = false
              disclosure.querySelector('summary')?.focus({ preventScroll: true })
            }
          }}><span>{locale === 'ka' ? 'დაკეცვა' : 'Collapse'}</span><LaptopIcon name="chevron" /></button>
        </div>
        <p className="account-service-expanded__timezone">{copy.localTime}</p>
        <CustomerTicketProgress status={ticket.status} locale={locale} />
        <dl className="account-service-expanded__metadata">
            {device !== model && <Field label={copy.device}>{device}</Field>}
            <Field label={copy.model}>{model}</Field>
            <Field label={copy.registeredTime}><time dateTime={ticket.created_at}>{accountDate(ticket.created_at, locale, true)}</time></Field>
            <Field label={copy.updated}><time dateTime={ticket.updated_at}>{accountDate(ticket.updated_at, locale, true)}</time></Field>
        </dl>
        <dl className={`account-service-expanded__notes${ticket.resolution ? ' has-resolution' : ''}`}>
            <Field label={copy.issue}>{ticket.issue_description || copy.missing}</Field>
            {ticket.resolution && <Field label={copy.resolution}>{ticket.resolution}</Field>}
        </dl>
        {ticket.items.length > 0 && <section className="account-service-devices" aria-label={copy.devices}>
          <DetailHeading>{toGeorgianMtavruli(copy.devices)}<span>{ticket.items.length}</span></DetailHeading>
          {ticket.items.map((item, index) => <div className="account-service-device" key={`${item.position}-${index}`}>
            <div className="account-service-device__heading"><span className="account-service-device__identity"><span className="account-service-device__number">{item.position}</span><strong>{item.device ? deviceLabel(item.device) : `${copy.device} ${item.position}`}</strong></span><ServiceStatus status={item.status} copy={copy} /></div>
            <dl className="account-service-expanded__fields">
              {item.serial_number && <Field label={copy.serialNumber}>{item.serial_number}</Field>}
              <Field label={copy.issue}>{item.issue_description || copy.missing}</Field>
              <Field label={copy.updated}>{accountDate(item.updated_at, locale, true)}</Field>
              {item.resolution && <Field label={copy.resolution}>{item.resolution}</Field>}
            </dl>
          </div>)}
        </section>}
      </div>
    </details>
  </article>
}

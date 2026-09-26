import { useTranslation } from '../i18n/LocaleProvider'
import type { Ticket } from '../data/tickets'
import { toGeorgianMtavruli } from '../utils/text'
import { TicketMilestones } from './TicketMilestones'

export function TicketResult({ ticket }: { ticket: Ticket }) {
  const l10n = useTranslation()
  return (
    <article className="ticket-result" aria-live="polite">
      <header className="ticket-result__header">
        <h3>{l10n.t(toGeorgianMtavruli('სერვისი'))} #{l10n.t(ticket.code)}</h3>
        <span className="ticket-status-pill">
          <img src="/assets/icons/status-dot.svg" alt="" />
          {l10n.t(ticket.statusLabel)}
        </span>
      </header>
      <div className="ticket-result__body">
        <dl className="ticket-metadata">
          <div><dt>{l10n.t("მოწყობილობა")}</dt><dd>{l10n.t(ticket.device)}</dd></div>
          <div><dt>{l10n.t("მოდელი")}</dt><dd>{l10n.t(ticket.model)}</dd></div>
          <div><dt>{l10n.t("მიღების თარიღი")}</dt><dd>{l10n.t(ticket.receivedDate)}</dd></div>
          <div><dt>{l10n.t("ბოლო განახლება")}</dt><dd>{l10n.t(ticket.lastUpdated)}</dd></div>
          <div className="ticket-privacy">
            <img src="/assets/icons/lock.svg" alt="" />
            <span>{l10n.t("პირადი დეტალები ხელმისაწვდომია მხოლოდ ნომრის დადასტურების შემდეგ.")}</span>
          </div>
        </dl>
        <div className="ticket-progress">
          <TicketMilestones locale={l10n.locale} milestones={ticket.milestones.map(milestone => ({
            ...milestone,
            label: l10n.t(milestone.label),
            helperText: l10n.t(milestone.helperText || 'მიმდინარე'),
          }))} />
          <div className="status-summary">
            <strong>{l10n.t(toGeorgianMtavruli(ticket.statusLabel))}</strong>
            <span>{l10n.t(ticket.update)}</span>
            <small>{l10n.t(ticket.updateNote)}</small>
          </div>
        </div>
      </div>
    </article>
  )
}

import type { Ticket } from '../data/tickets'

export function TicketResult({ ticket }: { ticket: Ticket }) {
  return (
    <article className="ticket-result" aria-live="polite">
      <header className="ticket-result__header">
        <h3>სერვისი #{ticket.code}</h3>
        <span className="ticket-status-pill">
          <img src="/assets/icons/status-dot.svg" alt="" />
          {ticket.statusLabel}
        </span>
      </header>
      <div className="ticket-result__body">
        <dl className="ticket-metadata">
          <div><dt>მოწყობილობა</dt><dd>{ticket.device}</dd></div>
          <div><dt>მოდელი</dt><dd>{ticket.model}</dd></div>
          <div><dt>მიღების თარიღი</dt><dd>{ticket.receivedDate}</dd></div>
          <div><dt>ბოლო განახლება</dt><dd>{ticket.lastUpdated}</dd></div>
          <div className="ticket-privacy">
            <img src="/assets/icons/lock.svg" alt="" />
            <span>პირადი დეტალები ხელმისაწვდომია მხოლოდ ნომრის დადასტურების შემდეგ.</span>
          </div>
        </dl>
        <div className="ticket-progress">
          <ol className="milestones">
            {ticket.milestones.map((milestone, index) => (
              <li className={`${milestone.state === 'complete' ? 'is-complete' : ''}${milestone.state === 'current' ? ' is-current' : ''}`} key={milestone.label}>
                <span className="milestone-marker">
                  {milestone.state === 'complete' ? <img src="/assets/icons/check-white.svg" alt="" /> : null}
                </span>
                <span>{milestone.label}</span>
                {milestone.state === 'current' ? <small>{milestone.helperText || 'მიმდინარე'}</small> : null}
                {index < ticket.milestones.length - 1 ? <i aria-hidden="true" /> : null}
              </li>
            ))}
          </ol>
          <div className="status-summary">
            <strong>{ticket.statusLabel}</strong>
            <span>{ticket.update}</span>
            <small>{ticket.updateNote}</small>
          </div>
        </div>
      </div>
    </article>
  )
}

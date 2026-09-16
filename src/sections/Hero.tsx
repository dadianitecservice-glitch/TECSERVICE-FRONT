import { useRef, useState } from 'react'
import { toGeorgianMtavruli } from '../utils/text'
import {
  askTecServiceAssistant,
  AssistantApiError,
  type AssistantAssessment,
  type AssistantHistoryMessage,
} from '../utils/assistantApi'
import { LaptopIcon } from '../components/LaptopIcon'

const devices = [
  { id: 'computers', label: 'კომპიუტერები', icon: '/assets/icons/device-computer.svg' },
  { id: 'recovery', label: 'ინფორმაციის აღდგენა', icon: '/assets/icons/device-recovery.svg', wide: true },
  { id: 'consoles', label: 'კონსოლები', icon: '/assets/icons/device-console.svg' },
  { id: 'drones', label: 'დრონები', icon: '/assets/icons/device-drone.svg' },
  { id: 'other', label: 'სხვა', icon: '/assets/icons/device-other.svg' },
]

type Assessment = {
  title: string
  explanation: string
  details: AssistantAssessment | null
}

function createAssistantSessionId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `web_${crypto.randomUUID().replaceAll('-', '')}`
  }
  return `web_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`
}

function getAssistantSessionId() {
  const storageKey = 'tecservice-ai-session'
  if (typeof window === 'undefined') return createAssistantSessionId()

  try {
    const existing = window.sessionStorage.getItem(storageKey)
    if (existing && /^[A-Za-z0-9_-]{8,64}$/.test(existing)) return existing

    const created = createAssistantSessionId()
    window.sessionStorage.setItem(storageKey, created)
    return created
  } catch {
    return createAssistantSessionId()
  }
}

export function Hero() {
  const label = toGeorgianMtavruli
  const [selectedDevice, setSelectedDevice] = useState('computers')
  const [problem, setProblem] = useState('')
  const [attachmentName, setAttachmentName] = useState('')
  const [feedback, setFeedback] = useState<'required' | null>(null)
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [assistantHistory, setAssistantHistory] = useState<AssistantHistoryMessage[]>([])
  const [assistantError, setAssistantError] = useState('')
  const [isAssessing, setIsAssessing] = useState(false)
  const assistantSessionId = useRef(getAssistantSessionId())
  const fileInputRef = useRef<HTMLInputElement>(null)
  const problemInputRef = useRef<HTMLTextAreaElement>(null)
  const currentStep = assessment || isAssessing ? 3 : problem.trim() ? 2 : 1

  const runAssessment = async () => {
    if (!problem.trim()) {
      setFeedback('required')
      problemInputRef.current?.focus()
      return
    }

    const trimmedProblem = problem.trim()
    const deviceLabel = devices.find((device) => device.id === selectedDevice)?.label ?? 'სხვა მოწყობილობა'
    // “კომპიუტერები” is a broad UI category for both laptops and desktops.
    // Do not send it as a desktop-only hint; the described fault provides the
    // more precise catalogue match (for example, an HP laptop screen).
    const message = selectedDevice === 'computers'
      ? trimmedProblem
      : `მოწყობილობა: ${deviceLabel}\nპრობლემა: ${trimmedProblem}`

    setFeedback(null)
    setAssistantError('')
    setAssessment(null)
    setIsAssessing(true)

    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 25_000)

    try {
      const response = await askTecServiceAssistant({
        message,
        sessionId: assistantSessionId.current,
        history: assistantHistory,
        signal: controller.signal,
      })
      setAssessment({
        title: 'TECSERVICE AI-ის პირველადი შეფასება',
        explanation: response.reply,
        details: response.assessment,
      })
      setAssistantHistory((current) => [
        ...current,
        { role: 'user', content: message },
        { role: 'assistant', content: response.reply },
      ].slice(-6) as AssistantHistoryMessage[])
    } catch (error) {
      if (error instanceof AssistantApiError && error.status === 429) {
        setAssistantError('მოთხოვნების ლიმიტი დროებით ამოიწურა. გთხოვთ, ცოტა ხანში სცადოთ.')
      } else if (error instanceof DOMException && error.name === 'AbortError') {
        setAssistantError('პასუხის მიღებას მოსალოდნელზე მეტი დრო დასჭირდა. გთხოვთ, ხელახლა სცადოთ.')
      } else {
        setAssistantError('AI ასისტენტთან დაკავშირება ვერ მოხერხდა. გთხოვთ, რამდენიმე წამში ხელახლა სცადოთ.')
      }
    } finally {
      window.clearTimeout(timeout)
      setIsAssessing(false)
    }
  }

  return (
    <section className={`hero${assessment ? ' hero--assessed' : ''}`} aria-labelledby="hero-title">
      <div className="hero__circuit" aria-hidden="true">
        <img src="/assets/icons/circuit-lines.svg" alt="" />
        <img src="/assets/icons/circuit-dots.svg" alt="" />
      </div>
      <div className="hero__content">
        <h1 id="hero-title" className="display-title hero__title">
          <span>{toGeorgianMtavruli('ტექნიკის')}</span>{' '}
          <span className="text-blue">{toGeorgianMtavruli('პროფესიონალური')}</span>{' '}
          <span>{toGeorgianMtavruli('შეკეთება და')}<br className="hero__reference-break" />{' '}{toGeorgianMtavruli('დიაგნოსტიკა')}</span>
        </h1>
        <p className="hero__description">
          ლეპტოპების, კომპიუტერების, კონსოლების, ინფორმაციის აღდგენის, დრონებისა და სხვა
          ელექტრონული ტექნიკის პროფესიონალური შეკეთება და დიაგნოსტიკა.
        </p>
        <p className="hero__support">პროგრამული, ჰარდვეარული და ლაბორატორიული სერვისი.</p>
        <div className="hero__actions">
          <button
            className="button button--primary"
            type="button"
            onClick={() => document.querySelector('#ticket')?.scrollIntoView({ behavior: 'smooth' })}
          >
            {toGeorgianMtavruli('სერვისის სტატუსი')}
            <img src="/assets/icons/arrow-right-white.svg" alt="" />
          </button>
          <button
            className="button button--secondary"
            type="button"
            onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <img src="/assets/icons/contact-red.svg" alt="" />
            {label('დაგვიკავშირდით')}
          </button>
        </div>
        <div className="hero__trust" aria-label="სერვისის უპირატესობები">
          <div className="trust-item">
            <LaptopIcon name="tool" />
            <span>პროფესიონალური<br />დიაგნოსტიკა</span>
          </div>
          <div className="trust-item">
            <LaptopIcon name="people" />
            <span>სამუშაოს წინასწარი<br />შეთანხმება</span>
          </div>
          <div className="trust-item">
            <LaptopIcon name="calendar" />
            <span>2002 წლიდან</span>
          </div>
        </div>
      </div>

      <div className="ai-card-wrap">
        <form className="ai-card" onSubmit={(event) => { event.preventDefault(); void runAssessment() }}>
          <h2 className="display-title">{toGeorgianMtavruli('რა სჭირს თქვენს ტექნიკას?')}</h2>
          <p className="ai-card__subtitle">აირჩიეთ მოწყობილობა და აღწერეთ პრობლემა.</p>
          <div className="ai-steps" aria-label={`მიმდინარე ეტაპი ${currentStep}`}>
            {['მოწყობილობა', 'პრობლემა', 'შეფასება'].map((label, index) => (
              <div className={`ai-step${currentStep === index + 1 ? ' is-active' : ''}`} key={label}>
                {index + 1}&nbsp; {label}
              </div>
            ))}
          </div>

          <fieldset className="device-fieldset" disabled={isAssessing}>
            <legend>აირჩიეთ მოწყობილობა</legend>
            <div className="device-selector">
              {devices.map((device) => (
                <button
                  className={`device-option${selectedDevice === device.id ? ' is-selected' : ''}${device.wide ? ' device-option--wide' : ''}`}
                  type="button"
                  key={device.id}
                  aria-pressed={selectedDevice === device.id}
                  onClick={() => { setSelectedDevice(device.id); setFeedback(null); setAssistantError(''); setAssessment(null); setAssistantHistory([]) }}
                >
                  <img src={device.icon} alt="" />
                  <span>{label(device.label)}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="problem-field">
            <label htmlFor="problem-description">აღწერეთ პრობლემა</label>
            <span className="textarea-shell">
              <textarea
                ref={problemInputRef}
                id="problem-description"
                value={problem}
                disabled={isAssessing}
                aria-invalid={feedback === 'required'}
                aria-describedby={feedback === 'required' ? 'ai-feedback ai-mode-note' : assistantError ? 'ai-error ai-mode-note' : 'ai-mode-note'}
                maxLength={700}
                onChange={(event) => { setProblem(event.target.value); setFeedback(null); setAssistantError(''); setAssessment(null) }}
                placeholder="მაგ: არ ირთვება, ხურდება, ეკრანი არ მუშაობს, აქვს უცნაური ხმა..."
              />
              <button
                type="button"
                className="attachment-button"
                disabled={isAssessing}
                onClick={() => fileInputRef.current?.click()}
                aria-label={attachmentName ? `${toGeorgianMtavruli('მიმაგრებულია')}: ${attachmentName}` : toGeorgianMtavruli('ფაილის მიმაგრება')}
                title={attachmentName || toGeorgianMtavruli('ფაილის მიმაგრება')}
              >
                <img src="/assets/icons/attachment.svg" alt="" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                hidden
                onChange={(event) => setAttachmentName(event.target.files?.[0]?.name ?? '')}
              />
            </span>
          </div>

          <button
            className={`ai-submit${assessment ? ' is-complete' : ''}`}
            type="submit"
            disabled={isAssessing}
            aria-busy={isAssessing}
          >
            <img src="/assets/icons/sparkles.svg" alt="" />
            {isAssessing ? label('AI პასუხს ამზადებს...') : label('AI პირველადი შეფასება')}
          </button>
          <p id="ai-mode-note" className="ai-disclaimer ai-development-note">
            <strong>TECSERVICE AI სატესტო რეჟიმშია</strong>
            <span>პასუხი ეფუძნება ჩვენს სერვისებს, საორიენტაციო ფასებსა და უსაფრთხოების წესებს.</span>
          </p>
          {feedback === 'required' && <p id="ai-feedback" className="ai-disclaimer" role="alert">შეფასების დასაწყებად აღწერეთ პრობლემა.</p>}
          {assistantError && <p id="ai-error" className="ai-disclaimer ai-error" role="alert">{assistantError}</p>}
          {attachmentName && <p className="ai-disclaimer">არჩეულია: {attachmentName}. ამ რეჟიმში ფაილი არ იგზავნება და არ გაანალიზდება.</p>}
          {assessment && <section className="ai-result" aria-label="პირველადი შეფასების შედეგი" role="status">
            <h3><span aria-hidden="true">📌</span> {assessment.title}</h3>
            {assessment.details ? <>
              <ul className="ai-result__assessment">
                <li><strong>მომსახურება:</strong> {assessment.details.service}</li>
                <li>
                  <strong>სამუშაოს ღირებულება:</strong> {assessment.details.labor_price}
                  {assessment.details.price_note && <> <em>({assessment.details.price_note})</em></>}
                </li>
                <li><strong>სავარაუდო ვადა:</strong> {assessment.details.estimated_duration}</li>
              </ul>
              <p className="ai-result__warning">
                <span aria-hidden="true">⚠️</span>{' '}
                <em>{assessment.details.disclaimer}</em>
              </p>
            </> : <>
              <p className="ai-result__reply">{assessment.explanation}</p>
              <a href="#contact">დაუკავშირდით სერვისს →</a>
            </>}
          </section>}
        </form>
      </div>
    </section>
  )
}

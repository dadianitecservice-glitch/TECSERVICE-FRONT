import { useEffect, useRef, useState } from 'react'
import { toGeorgianMtavruli } from '../utils/text'
import type { ServicePriceAssessment } from '../utils/servicePriceAssistant'
import { loadServicePriceAssistant } from '../utils/loadServicePriceAssistant'
import { LaptopIcon } from '../components/LaptopIcon'
import { useTranslation } from '../i18n/LocaleProvider'

const devices = [
  { id: 'computers', label: 'კომპიუტერები', icon: '/assets/icons/device-computer.svg' },
  { id: 'recovery', label: 'ინფორმაციის აღდგენა', icon: '/assets/icons/device-recovery.svg', wide: true },
  { id: 'consoles', label: 'კონსოლები', icon: '/assets/icons/device-console.svg' },
  { id: 'drones', label: 'დრონები', icon: '/assets/icons/device-drone.svg' },
  { id: 'other', label: 'სხვა', icon: '/assets/icons/device-other.svg' },
]

export function Hero() {
  const l10n = useTranslation()
  const label = (value: string) => l10n.t(toGeorgianMtavruli(value))
  const [selectedDevice, setSelectedDevice] = useState('computers')
  const [problem, setProblem] = useState('')
  const [feedback, setFeedback] = useState<'required' | 'unavailable' | null>(null)
  const [assessment, setAssessment] = useState<ServicePriceAssessment | null>(null)
  const [assessmentPending, setAssessmentPending] = useState(false)
  const requestVersion = useRef(0)
  const pendingRequest = useRef(false)
  const problemInputRef = useRef<HTMLTextAreaElement>(null)
  const currentStep = assessment ? 3 : problem.trim() ? 2 : 1

  useEffect(() => () => { requestVersion.current += 1 }, [])

  const clearAssessment = () => {
    // Editing while a chunk downloads invalidates that request's captured input.
    requestVersion.current += 1
    pendingRequest.current = false
    setAssessmentPending(false)
    setFeedback(null)
    setAssessment(null)
  }

  const runAssessment = async () => {
    if (pendingRequest.current) return
    if (!problem.trim()) {
      setFeedback('required')
      problemInputRef.current?.focus()
      return
    }

    setFeedback(null)
    const version = ++requestVersion.current
    pendingRequest.current = true
    setAssessmentPending(true)
    try {
      const { getServicePriceAssessment } = await loadServicePriceAssistant()
      if (version !== requestVersion.current) return
      setAssessment(getServicePriceAssessment(selectedDevice, problem.trim(), l10n.locale, l10n.t))
    } catch {
      if (version === requestVersion.current) setFeedback('unavailable')
    } finally {
      if (version === requestVersion.current) {
        pendingRequest.current = false
        setAssessmentPending(false)
      }
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
          {l10n.locale === 'en' ? <>
            <span className="text-blue">Professional</span>{' '}
            <span>device</span>{' '}
            <span>repair and<br className="hero__reference-break" />{' '}diagnostics</span>
          </> : <>
          <span>{toGeorgianMtavruli('ტექნიკის')}</span>{' '}
          <span className="text-blue">{toGeorgianMtavruli('პროფესიონალური')}</span>{' '}
          <span>{toGeorgianMtavruli('შეკეთება და')}<br className="hero__reference-break" />{' '}{toGeorgianMtavruli('დიაგნოსტიკა')}</span>
          </>}
        </h1>
        <p className="hero__description">
          {l10n.t('ლეპტოპების, კომპიუტერების, კონსოლების, ინფორმაციის აღდგენის, დრონებისა და სხვა ელექტრონული ტექნიკის პროფესიონალური შეკეთება და დიაგნოსტიკა.')}
        </p>
        <p className="hero__support">{l10n.t('პროგრამული, ჰარდვეარული და ლაბორატორიული სერვისი.')}</p>
        <div className="hero__actions">
          <button
            className="button button--primary"
            type="button"
            onClick={() => document.querySelector('#ticket')?.scrollIntoView({ behavior: 'smooth' })}
          >
            {label('სერვისის სტატუსი')}
            <img src="/assets/icons/arrow-right-white.svg" alt="" />
          </button>
          <a
            className="button button--secondary"
            href={l10n.href('/contact/')}
          >
            <img src="/assets/icons/contact-red.svg" alt="" />
            {label('დაგვიკავშირდით')}
          </a>
        </div>
        <div className="hero__trust" aria-label={l10n.t('სერვისის უპირატესობები')}>
          <div className="trust-item">
            <LaptopIcon name="tool" />
            <span>{l10n.t('პროფესიონალური')}<br />{l10n.t('დიაგნოსტიკა')}</span>
          </div>
          <div className="trust-item">
            <LaptopIcon name="people" />
            <span>{l10n.locale === 'en' ? <>Work agreed<br />in advance</> : <>სამუშაოს წინასწარი<br />შეთანხმება</>}</span>
          </div>
          <div className="trust-item">
            <LaptopIcon name="calendar" />
            <span>{l10n.t('2002 წლიდან')}</span>
          </div>
        </div>
      </div>

      <div className="ai-card-wrap">
        <form className="ai-card" aria-busy={assessmentPending} onSubmit={(event) => { event.preventDefault(); void runAssessment() }}>
          <h2 className="display-title">{label('რა სჭირს თქვენს ტექნიკას?')}</h2>
          <p className="ai-card__subtitle">{l10n.t('აირჩიეთ მოწყობილობა და აღწერეთ პრობლემა.')}</p>
          <div className="ai-steps" aria-label={l10n.locale === 'en' ? `Current step ${currentStep}` : `მიმდინარე ეტაპი ${currentStep}`}>
            {['მოწყობილობა', 'პრობლემა', 'შეფასება'].map((label, index) => (
              <div className={`ai-step${currentStep === index + 1 ? ' is-active' : ''}`} key={label}>
                {index + 1}&nbsp; {l10n.t(label)}
              </div>
            ))}
          </div>

          <fieldset className="device-fieldset">
            <legend>{l10n.t('აირჩიეთ მოწყობილობა')}</legend>
            <div className="device-selector">
              {devices.map((device) => (
                <button
                  className={`device-option${selectedDevice === device.id ? ' is-selected' : ''}${device.wide ? ' device-option--wide' : ''}`}
                  type="button"
                  key={device.id}
                  aria-pressed={selectedDevice === device.id}
                  onClick={() => { setSelectedDevice(device.id); clearAssessment() }}
                >
                  <img src={device.icon} alt="" />
                  <span>{label(device.label)}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="problem-field">
            <label htmlFor="problem-description">{l10n.t('აღწერეთ პრობლემა')}</label>
            <span className="textarea-shell">
              <textarea
                ref={problemInputRef}
                id="problem-description"
                value={problem}
                aria-invalid={feedback === 'required'}
                aria-describedby={feedback === 'required' ? 'ai-feedback' : undefined}
                maxLength={700}
                onChange={(event) => { setProblem(event.target.value); clearAssessment() }}
                placeholder={l10n.t('მაგ: არ ირთვება, ხურდება, ეკრანი არ მუშაობს, აქვს უცნაური ხმა...')}
              />
            </span>
          </div>

          <button
            className={`ai-submit${assessment ? ' is-complete' : ''}`}
            type="submit"
            disabled={assessmentPending}
          >
            <img src="/assets/icons/sparkles.svg" alt="" />
            {assessmentPending ? (l10n.locale === 'en' ? 'Loading…' : 'იტვირთება…') : label('AI პირველადი შეფასება')}
          </button>
          {feedback === 'required' && <p id="ai-feedback" className="ai-disclaimer" role="alert">{l10n.t('შეფასების დასაწყებად აღწერეთ პრობლემა.')}</p>}
          {feedback === 'unavailable' && <p className="ai-disclaimer" role="alert">{l10n.locale === 'en' ? 'Could not load the assessment. Please try again, or contact us.' : 'შეფასება ვერ ჩაიტვირთა. სცადეთ ხელახლა ან დაგვიკავშირდით.'}{' '}<a href={l10n.href('/contact/')}>{l10n.t('დაგვიკავშირდით')}</a></p>}
          {assessment && <section className="ai-result" aria-label={l10n.t('პირველადი შეფასების შედეგი')} role="status">
            <h3><span aria-hidden="true">📌</span> {l10n.locale === 'en' ? 'Service information' : 'ინფორმაცია მომსახურებაზე'}</h3>
            <p className="ai-result__reply">{assessment.reply}</p>
            {assessment.assessment && <>
              <ul className="ai-result__assessment">
                <li><strong>{l10n.t('მომსახურება:')}</strong> {assessment.assessment.service}</li>
                <li>
                  <strong>{l10n.t('სამუშაოს ღირებულება:')}</strong> {assessment.assessment.labor_price}
                  {assessment.assessment.price_note && <> <em>({assessment.assessment.price_note})</em></>}
                </li>
                <li><strong>{l10n.t('სავარაუდო ვადა:')}</strong> {assessment.assessment.estimated_duration}</li>
              </ul>
              <p className="ai-result__warning">
                <span aria-hidden="true">⚠️</span>{' '}
                <em>{assessment.assessment.disclaimer}</em>
              </p>
            </>}
            {assessment.sources.length > 0 && <div className="ai-result__sources">
              {assessment.sources.map((source) => <a key={source.path} href={l10n.href(source.path)}>{source.label} →</a>)}
            </div>}
            {!assessment.assessment && <a href={l10n.href('/contact/')}>{l10n.t('დაუკავშირდით სერვისს →')}</a>}
          </section>}
        </form>
      </div>
    </section>
  )
}

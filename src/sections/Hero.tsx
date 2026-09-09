import { useRef, useState } from 'react'
import { toGeorgianMtavruli } from '../utils/text'

const devices = [
  { id: 'computers', label: 'კომპიუტერები', icon: '/assets/icons/device-computer.svg' },
  { id: 'recovery', label: 'ინფორმაციის აღდგენა', icon: '/assets/icons/device-recovery.svg', wide: true },
  { id: 'consoles', label: 'კონსოლები', icon: '/assets/icons/device-console.svg' },
  { id: 'drones', label: 'დრონები', icon: '/assets/icons/device-drone.svg' },
  { id: 'other', label: 'სხვა', icon: '/assets/icons/device-other.svg' },
]

export function Hero() {
  const [selectedDevice, setSelectedDevice] = useState('computers')
  const [problem, setProblem] = useState('')
  const [attachmentName, setAttachmentName] = useState('')
  const [feedback, setFeedback] = useState<'required' | 'unavailable' | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const problemInputRef = useRef<HTMLTextAreaElement>(null)
  const currentStep = problem.trim() ? 2 : 1

  const runAssessment = () => {
    if (!problem.trim()) {
      setFeedback('required')
      problemInputRef.current?.focus()
      return
    }
    setFeedback('unavailable')
  }

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__circuit" aria-hidden="true">
        <img src="/assets/icons/circuit-lines.svg" alt="" />
        <img src="/assets/icons/circuit-dots.svg" alt="" />
      </div>
      <div className="hero__content">
        <h1 id="hero-title" className="display-title hero__title">
          <span>{toGeorgianMtavruli('ტექნიკის')}</span>{' '}
          <span className="text-blue">{toGeorgianMtavruli('პროფესიონალური')}</span>{' '}
          <span>{toGeorgianMtavruli('შეკეთება და დიაგნოსტიკა')}</span>
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
            {toGeorgianMtavruli('დაგვიკავშირდით')}
          </button>
        </div>
        <div className="hero__trust" aria-label="სერვისის უპირატესობები">
          {['პროფესიონალური დიაგნოსტიკა', 'რთული ელექტრონიკის შეკეთება', '2002 წლიდან'].map((item) => (
            <div className="trust-item" key={item}>
              <img src="/assets/icons/check-blue.svg" alt="" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="ai-card-wrap">
        <form className="ai-card" onSubmit={(event) => { event.preventDefault(); runAssessment() }}>
          <h2 className="display-title">{toGeorgianMtavruli('რა სჭირს თქვენს ტექნიკას?')}</h2>
          <p className="ai-card__subtitle">აირჩიეთ მოწყობილობა და აღწერეთ პრობლემა.</p>
          <div className="ai-steps" aria-label={`მიმდინარე ეტაპი ${currentStep}`}>
            {['მოწყობილობა', 'პრობლემა', 'შეფასება'].map((label, index) => (
              <div className={`ai-step${currentStep === index + 1 ? ' is-active' : ''}`} key={label}>
                {index + 1}&nbsp; {label}
              </div>
            ))}
          </div>

          <fieldset className="device-fieldset">
            <legend>{toGeorgianMtavruli('აირჩიეთ მოწყობილობა')}</legend>
            <div className="device-selector">
              {devices.map((device) => (
                <button
                  className={`device-option${selectedDevice === device.id ? ' is-selected' : ''}${device.wide ? ' device-option--wide' : ''}`}
                  type="button"
                  key={device.id}
                  aria-pressed={selectedDevice === device.id}
                  onClick={() => { setSelectedDevice(device.id); setFeedback(null) }}
                >
                  <img src={device.icon} alt="" />
                  <span>{toGeorgianMtavruli(device.label)}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="problem-field">
            <label htmlFor="problem-description">{toGeorgianMtavruli('აღწერეთ პრობლემა')}</label>
            <span className="textarea-shell">
              <textarea
                ref={problemInputRef}
                id="problem-description"
                value={problem}
                aria-invalid={feedback === 'required'}
                aria-describedby="ai-feedback"
                onChange={(event) => { setProblem(event.target.value); setFeedback(null) }}
                placeholder="მაგ: არ ირთვება, ხურდება, ეკრანი არ მუშაობს, აქვს უცნაური ხმა..."
              />
              <button
                type="button"
                className="attachment-button"
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

          <button className="ai-submit" type="submit">
            <img src="/assets/icons/sparkles.svg" alt="" />
            {toGeorgianMtavruli('AI პირველადი შეფასება')}
          </button>
          <p id="ai-feedback" className="ai-disclaimer" role={feedback === 'required' ? 'alert' : 'status'}>
            {feedback === 'required' ? <>შეფასების დასაწყებად აღწერეთ პრობლემა.<br />ცარიელი აღწერით შეფასება ვერ დაიწყება.</> : feedback === 'unavailable' ? <>
              AI შეფასება ჯერ არ არის ჩართული.<br />შეფასება არ შექმნილა და თქვენი აღწერა არ გაგზავნილა.
            </> : <>
              AI მოგცემთ სავარაუდო მიზეზს და რეკომენდაციას.<br />
              საბოლოო დიაგნოზი და ფასი დგინდება ტექნიკის შემოწმების შემდეგ.
            </>}
          </p>
        </form>
      </div>
    </section>
  )
}

import { useRef, useState } from 'react'

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
  const [assessing, setAssessing] = useState(false)
  const [assessed, setAssessed] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const currentStep = assessed ? 3 : problem.trim() ? 2 : 1

  const runAssessment = () => {
    setAssessing(true)
    setAssessed(false)
    window.setTimeout(() => {
      setAssessing(false)
      setAssessed(true)
    }, 800)
  }

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__circuit" aria-hidden="true">
        <img src="/assets/icons/circuit-lines.svg" alt="" />
        <img src="/assets/icons/circuit-dots.svg" alt="" />
      </div>
      <div className="hero__content">
        <h1 id="hero-title" className="display-title hero__title">
          <span>ტექნიკის</span>
          <span className="text-blue">პროფესიონალური</span>
          <span>შეკეთება და დიაგნოსტიკა</span>
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
            onClick={() => document.querySelector('#services')?.scrollIntoView({ behavior: 'smooth' })}
          >
            სერვისების ნახვა
            <img src="/assets/icons/arrow-right-white.svg" alt="" />
          </button>
          <button
            className="button button--secondary"
            type="button"
            onClick={() => document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <img src="/assets/icons/contact-red.svg" alt="" />
            დაგვიკავშირდით
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
          <h2 className="display-title">რა სჭირს თქვენს ტექნიკას?</h2>
          <p className="ai-card__subtitle">აირჩიეთ მოწყობილობა და აღწერეთ პრობლემა.</p>
          <div className="ai-steps" aria-label={`მიმდინარე ეტაპი ${currentStep}`}>
            {['მოწყობილობა', 'პრობლემა', 'შეფასება'].map((label, index) => (
              <div className={`ai-step${currentStep === index + 1 ? ' is-active' : ''}`} key={label}>
                {index + 1}&nbsp; {label}
              </div>
            ))}
          </div>

          <fieldset className="device-fieldset">
            <legend>აირჩიეთ მოწყობილობა</legend>
            <div className="device-selector">
              {devices.map((device) => (
                <button
                  className={`device-option${selectedDevice === device.id ? ' is-selected' : ''}${device.wide ? ' device-option--wide' : ''}`}
                  type="button"
                  key={device.id}
                  aria-pressed={selectedDevice === device.id}
                  onClick={() => { setSelectedDevice(device.id); setAssessed(false) }}
                >
                  <img src={device.icon} alt="" />
                  <span>{device.label}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="problem-field">
            <label htmlFor="problem-description">აღწერეთ პრობლემა</label>
            <span className="textarea-shell">
              <textarea
                id="problem-description"
                value={problem}
                onChange={(event) => { setProblem(event.target.value); setAssessed(false) }}
                placeholder="მაგ: არ ირთვება, ხურდება, ეკრანი არ მუშაობს, აქვს უცნაური ხმა..."
              />
              <button
                type="button"
                className="attachment-button"
                onClick={() => fileInputRef.current?.click()}
                aria-label={attachmentName ? `მიმაგრებულია: ${attachmentName}` : 'ფაილის მიმაგრება'}
                title={attachmentName || 'ფაილის მიმაგრება'}
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

          <button className={`ai-submit${assessed ? ' is-complete' : ''}`} type="submit" disabled={assessing}>
            <img src="/assets/icons/sparkles.svg" alt="" />
            {assessing ? 'მუშავდება...' : assessed ? 'შეფასება მზადაა' : 'AI პირველადი შეფასება'}
          </button>
          <p className="ai-disclaimer" aria-live="polite">
            AI მოგცემთ სავარაუდო მიზეზს და რეკომენდაციას.<br />
            საბოლოო დიაგნოზი და ფასი დგინდება ტექნიკის შემოწმების შემდეგ.
          </p>
        </form>
      </div>
    </section>
  )
}

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { DEMO_OTP } from '../data/tickets'
import { toGeorgianMtavruli } from '../utils/text'
import { updateOtpDigits } from '../utils/validation'

type OtpVerificationProps = {
  phone: string
  errorMessage: string
  onCodeChange: () => void
  onConfirm: (code: string) => void
  onBack: () => void
}

export function OtpVerification({ phone, errorMessage, onCodeChange, onConfirm, onBack }: OtpVerificationProps) {
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])
  const pendingFocusRef = useRef<number | null>(null)

  // Let native paste/input finish before moving focus to the next controlled field.
  useLayoutEffect(() => {
    const index = pendingFocusRef.current
    if (index === null) return
    pendingFocusRef.current = null
    const frame = window.requestAnimationFrame(() => inputsRef.current[index]?.focus())
    return () => window.cancelAnimationFrame(frame)
  }, [digits])

  useEffect(() => { inputsRef.current[0]?.focus() }, [])

  useEffect(() => {
    if (!errorMessage) return
    const firstEmpty = inputsRef.current.find((input) => input && !input.value)
    const input = firstEmpty ?? inputsRef.current[0]
    input?.focus()
    input?.select()
  }, [errorMessage])

  const updateDigit = (index: number, value: string) => {
    setDigits((current) => {
      const next = updateOtpDigits(current, index, value)
      pendingFocusRef.current = next.focusIndex
      return next.digits
    })
    onCodeChange()
  }

  const handlePaste = (index: number, value: string) => {
    const incoming = value.replace(/\D/g, '').slice(0, 6)
    if (!incoming) return

    setDigits((current) => {
      const next = updateOtpDigits(current, index, incoming)
      pendingFocusRef.current = next.focusIndex
      return next.digits
    })
    onCodeChange()
  }

  const handleBackspace = (index: number) => {
    setDigits((current) => {
      const next = [...current]
      const target = next[index] || index === 0 ? index : index - 1
      next[target] = ''
      pendingFocusRef.current = target
      return next
    })
    onCodeChange()
  }

  return (
    <form className="otp-panel" onSubmit={(event) => { event.preventDefault(); onConfirm(digits.join('')) }}>
      <div className="otp-panel__icon"><img src="/assets/icons/shield.svg" alt="" /></div>
      <div className="otp-panel__copy">
        <h3 className="display-title">{toGeorgianMtavruli('SMS დადასტურება')}</h3>
        <p>დემო დადასტურება ნომრისთვის {phone}.</p>
        {errorMessage && <p id="otp-error" role="alert">{errorMessage}</p>}
      </div>
      <div className="otp-inputs" aria-label="ერთჯერადი კოდი">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(element) => { inputsRef.current[index] = element }}
            value={digit}
            inputMode="numeric"
            maxLength={index === 0 ? 6 : 1}
            autoComplete="off"
            aria-invalid={!!errorMessage}
            aria-describedby={`otp-help${errorMessage ? ' otp-error' : ''}`}
            aria-label={`${index + 1} ციფრი`}
            onFocus={(event) => event.currentTarget.select()}
            onChange={(event) => updateDigit(index, event.target.value)}
            onPaste={(event) => {
              event.preventDefault()
              handlePaste(index, event.clipboardData.getData('text'))
            }}
            onKeyDown={(event) => {
              if (event.key === 'Backspace') {
                event.preventDefault()
                handleBackspace(index)
              }
            }}
          />
        ))}
      </div>
      <button className="button button--primary otp-confirm" type="submit">
        {toGeorgianMtavruli('დადასტურება')}
      </button>
      <div className="otp-panel__links">
        <button type="button" onClick={() => {
          pendingFocusRef.current = 0
          setDigits(['', '', '', '', '', ''])
          onCodeChange()
        }}>{toGeorgianMtavruli('კოდის ხელახლა გაგზავნა')}</button>
        <button type="button" onClick={onBack}>{toGeorgianMtavruli('უკან დაბრუნება')}</button>
      </div>
      <small id="otp-help">რეალური SMS არ იგზავნება. დემო კოდი: {DEMO_OTP}</small>
    </form>
  )
}

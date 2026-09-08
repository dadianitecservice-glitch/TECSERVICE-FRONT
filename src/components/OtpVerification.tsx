import { useRef, useState } from 'react'

type OtpVerificationProps = {
  phone: string
  onConfirm: (code: string) => void
  onBack: () => void
}

export function OtpVerification({ phone, onConfirm, onBack }: OtpVerificationProps) {
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])

  const updateDigit = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = digit
    setDigits(next)
    if (digit && index < 5) inputsRef.current[index + 1]?.focus()
  }

  return (
    <div className="otp-panel">
      <div className="otp-panel__icon"><img src="/assets/icons/shield.svg" alt="" /></div>
      <div className="otp-panel__copy">
        <h3 className="display-title">SMS დადასტურება</h3>
        <p>6-ნიშნა კოდი გაიგზავნა ნომერზე {phone || '+995 5•• •• •• ••'}.</p>
      </div>
      <div className="otp-inputs" aria-label="ერთჯერადი კოდი">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(element) => { inputsRef.current[index] = element }}
            value={digit}
            inputMode="numeric"
            maxLength={1}
            aria-label={`${index + 1} ციფრი`}
            onChange={(event) => updateDigit(index, event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Backspace' && !digits[index] && index > 0) inputsRef.current[index - 1]?.focus()
            }}
          />
        ))}
      </div>
      <button className="button button--primary otp-confirm" type="button" onClick={() => onConfirm(digits.join(''))}>
        დადასტურება
      </button>
      <div className="otp-panel__links">
        <button type="button" onClick={() => setDigits(['', '', '', '', '', ''])}>კოდის ხელახლა გაგზავნა</button>
        <button type="button" onClick={onBack}>უკან დაბრუნება</button>
      </div>
      <small>დემო კოდი: 123456</small>
    </div>
  )
}

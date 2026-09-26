import { useTranslation } from '../i18n/LocaleProvider'
import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent } from 'react'
import type { LaptopIconName } from '../data/laptopRepair'
import { LaptopIcon } from './LaptopIcon'

const compactLayoutQuery = '(max-width: 900px)'

function subscribeToLayout(onChange: () => void) {
  const query = window.matchMedia(compactLayoutQuery)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

export function useCompactProblemLayout() {
  return useSyncExternalStore(
    subscribeToLayout,
    () => window.matchMedia(compactLayoutQuery).matches,
    () => false,
  )
}

type ProblemOption = { id: string; label: string; icon: LaptopIconName }

type ProblemSelectorProps = {
  problems: readonly ProblemOption[]
  selectedProblem: string
  onSelect: (id: string) => void
  compact: boolean
  label: string
  tabIdPrefix: string
  panelIdPrefix: string
  defaultProblemId: string
}

export function ProblemSelector({ problems, selectedProblem, onSelect, compact, label, tabIdPrefix, panelIdPrefix, defaultProblemId }: ProblemSelectorProps) {
  const l10n = useTranslation()
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const trigger = useRef<HTMLButtonElement>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const choices = useRef<(HTMLButtonElement | null)[]>([])
  const backdropPress = useRef(false)
  const [isOpen, setOpen] = useState(false)
  const pickerId = `${tabIdPrefix}-picker`
  const panelId = (id: string) => id === defaultProblemId ? panelIdPrefix : `${panelIdPrefix}-${id}`

  useEffect(() => {
    if (!compact) setOpen(false)
    if (!compact || !isOpen || !dialog.current) return
    const sheet = dialog.current
    const previousOverflow = document.body.style.overflow
    sheet.showModal()
    document.body.style.overflow = 'hidden'
    const selectedIndex = problems.findIndex(problem => problem.id === selectedProblem)
    choices.current[Math.max(0, selectedIndex)]?.focus({ preventScroll: true })
    choices.current[Math.max(0, selectedIndex)]?.scrollIntoView({ block: 'nearest' })
    return () => {
      sheet.close()
      document.body.style.overflow = previousOverflow
      const returnTarget = trigger.current ?? tabs.current[Math.max(0, selectedIndex)]
      returnTarget?.focus({ preventScroll: true })
    }
  }, [compact, isOpen, problems, selectedProblem])

  const moveChoice = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % problems.length
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + problems.length) % problems.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = problems.length - 1
    else return
    event.preventDefault()
    choices.current[next]?.focus()
  }

  const keepSheetFocus = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key !== 'Tab') return
    const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>('button')
    const first = buttons[0]
    const last = buttons[buttons.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last?.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first?.focus()
    }
  }

  const moveProblem = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % problems.length
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + problems.length) % problems.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = problems.length - 1
    else return
    event.preventDefault()
    onSelect(problems[next].id)
    tabs.current[next]?.focus()
  }

  if (compact) {
    const selected = problems.find(problem => problem.id === selectedProblem) ?? problems[0]
    return (
      <div className="lp-problem-picker">
        <span className="lp-problem-picker__caption" id={`${pickerId}-label`}>{l10n.t('აირჩიეთ პრობლემა')}</span>
        <button ref={trigger} type="button" className="lp-problem-picker__control" aria-haspopup="dialog" aria-expanded={isOpen} aria-controls={pickerId} aria-labelledby={`${pickerId}-label ${pickerId}-value`} onClick={() => setOpen(true)}>
          <span className="lp-problem-picker__icon"><LaptopIcon name={selected.icon} /></span>
          <span className="lp-problem-picker__value" id={`${pickerId}-value`}>{l10n.t(selected.label)}</span>
          <span className="lp-problem-picker__chevron"><LaptopIcon name="chevron" /></span>
        </button>
        <dialog ref={dialog} id={pickerId} className="lp-problem-sheet" aria-labelledby={`${pickerId}-title`} aria-describedby={`${pickerId}-hint`} onKeyDown={keepSheetFocus} onCancel={() => setOpen(false)} onClose={() => setOpen(false)} onPointerDown={event => { backdropPress.current = event.target === event.currentTarget }} onClick={event => {
          if (backdropPress.current && event.target === event.currentTarget) setOpen(false)
          backdropPress.current = false
        }}>
          <div className="lp-problem-sheet__surface">
            <header className="lp-problem-sheet__header">
              <div>
                <span className="lp-problem-sheet__eyebrow">TECSERVICE <span aria-hidden="true">/</span> {String(problems.length).padStart(2, '0')}</span>
                <h2 id={`${pickerId}-title`}>{l10n.t('აირჩიეთ პრობლემა')}</h2>
                <p id={`${pickerId}-hint`}>{l10n.t('აირჩიეთ შესაბამისი ვარიანტი.')}</p>
              </div>
              <button className="lp-problem-sheet__close" type="button" onClick={() => setOpen(false)} aria-label={l10n.t('დახურვა')}><LaptopIcon name="close" /></button>
            </header>
            <div className="lp-problem-sheet__choices" role="group" aria-label={l10n.t(label)}>
              {problems.map((problem, index) => (
                <button ref={node => { choices.current[index] = node }} className="lp-problem-sheet__choice" key={problem.id} type="button" aria-pressed={selectedProblem === problem.id} onKeyDown={event => moveChoice(event, index)} onClick={() => { onSelect(problem.id); setOpen(false) }}>
                  <span className="lp-problem-sheet__icon"><LaptopIcon name={problem.icon} /></span>
                  <span className="lp-problem-sheet__text">{l10n.t(problem.label)}</span>
                  <span className="lp-problem-sheet__indicator" aria-hidden="true">{selectedProblem === problem.id && <LaptopIcon name="check" />}</span>
                </button>
              ))}
            </div>
          </div>
        </dialog>
      </div>
    )
  }

  return (
    <div className="lp-problem-tabs" role="tablist" aria-label={l10n.t(label)} aria-orientation="vertical">
      {l10n.t(problems.map((problem, index) => (
        <button key={problem.id} ref={node => { tabs.current[index] = node }} id={`${tabIdPrefix}-${problem.id}`} role="tab" type="button" aria-selected={selectedProblem === problem.id} aria-controls={panelId(problem.id)} tabIndex={selectedProblem === problem.id ? 0 : -1} onClick={() => onSelect(problem.id)} onKeyDown={event => moveProblem(event, index)}>
          <LaptopIcon name={problem.icon} />
          <span>{l10n.t(problem.label)}</span>
          <span className="lp-selection-dot" aria-hidden="true" />
        </button>
      )))}
    </div>
  )
}

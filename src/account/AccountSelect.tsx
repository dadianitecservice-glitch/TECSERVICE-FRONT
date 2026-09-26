import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { LaptopIcon } from '../components/LaptopIcon'
import '../styles/account-select.css'

export type AccountSelectOption = { value: string; label: string }
export type AccountSelectProps = { id: string; label: string; value: string; options: AccountSelectOption[]; onChange: (value: string) => void; controls?: string }

export function AccountSelect({ id, label, value, options, onChange, controls }: AccountSelectProps) {
  const uniqueId = useId()
  const listId = `${id}-${uniqueId}-list`
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const list = useRef<HTMLUListElement>(null)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const selected = Math.max(0, options.findIndex(option => option.value === value))
  const search = useRef({ text: '', time: 0 })
  useEffect(() => {
    if (!open) return
    const dismiss = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false) }
    document.addEventListener('pointerdown', dismiss)
    return () => document.removeEventListener('pointerdown', dismiss)
  }, [open])
  useEffect(() => {
    if (open) list.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active, open])
  const show = (index = selected) => { setActive(index); setOpen(true) }
  const choose = (index: number) => { const option = options[index]; if (option) onChange(option.value); setOpen(false); trigger.current?.focus({ preventScroll: true }) }
  const keyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Tab') { setOpen(false); return }
    if (event.key === 'Escape') { event.preventDefault(); setOpen(false); return }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!open) show()
      else setActive(index => (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length)
      return
    }
    if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); show(event.key === 'Home' ? 0 : options.length - 1); return }
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); if (open) choose(active); else show(); return }
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault()
      const now = Date.now()
      search.current.text = now - search.current.time < 700 ? search.current.text + event.key : event.key
      search.current.time = now
      const match = options.findIndex(option => option.label.toLocaleLowerCase().startsWith(search.current.text.toLocaleLowerCase()))
      if (match >= 0) show(match)
    }
  }
  return <div className={`account-dropdown${open ? ' is-open' : ''}`} ref={root}>
    <span className="account-dropdown__label" id={`${id}-label`}>{label}</span>
    <button id={id} ref={trigger} type="button" role="combobox" aria-labelledby={`${id}-label ${id}-value`} aria-expanded={open} aria-haspopup="listbox" aria-controls={listId} aria-activedescendant={open ? `${listId}-${active}` : undefined} data-controls={controls} onClick={() => open ? setOpen(false) : show()} onKeyDown={keyDown} onBlur={event => { if (!root.current?.contains(event.relatedTarget as Node)) setOpen(false) }}>
      <span id={`${id}-value`}>{options[selected]?.label ?? value}</span><LaptopIcon name="chevron" />
    </button>
    {open && <ul id={listId} ref={list} role="listbox" aria-label={label} className="account-dropdown__list">
      {options.map((option, index) => <li id={`${listId}-${index}`} key={option.value} role="option" aria-selected={option.value === value} data-index={index} className={index === active ? 'is-focused' : ''} onPointerDown={event => event.preventDefault()} onPointerMove={() => setActive(index)} onClick={() => choose(index)}><span>{option.label}</span>{option.value === value && <LaptopIcon name="check" />}</li>)}
    </ul>}
  </div>
}

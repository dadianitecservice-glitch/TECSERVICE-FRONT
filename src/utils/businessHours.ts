export type BusinessHoursStatus = {
  isOpen: boolean
  label: string
  detail: string
}

const tbilisiClock = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Tbilisi',
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const weekdayNames = ['კვირას', 'ორშაბათს', 'სამშაბათს', 'ოთხშაბათს', 'ხუთშაბათს', 'პარასკევს', 'შაბათს']
const weeklyHours: ReadonlyArray<{ opens: number; closes: number } | null> = [
  null,
  { opens: 10, closes: 19 },
  { opens: 10, closes: 19 },
  { opens: 10, closes: 19 },
  { opens: 10, closes: 19 },
  { opens: 10, closes: 19 },
  { opens: 11, closes: 18 },
]

export function getBusinessHoursStatus(now: Date): BusinessHoursStatus {
  const parts = tbilisiClock.formatToParts(now)
  const weekday = weekdays.indexOf(parts.find(part => part.type === 'weekday')!.value)
  const hour = Number(parts.find(part => part.type === 'hour')!.value)
  const minute = Number(parts.find(part => part.type === 'minute')!.value)
  const minutes = hour * 60 + minute
  const today = weeklyHours[weekday]

  if (today && minutes >= today.opens * 60 && minutes < today.closes * 60) {
    return {
      isOpen: true,
      label: 'ახლა ღიაა',
      detail: `ღიაა ${today.closes}:00-მდე`,
    }
  }

  // Advance calendar weekdays, independent of the visitor's time zone or date.
  let daysUntilOpening = today && minutes < today.opens * 60 ? 0 : 1
  let nextWeekday = (weekday + daysUntilOpening) % 7
  while (!weeklyHours[nextWeekday]) {
    daysUntilOpening += 1
    nextWeekday = (weekday + daysUntilOpening) % 7
  }

  const nextOpening = weeklyHours[nextWeekday]!
  const nextDay = daysUntilOpening === 0
    ? 'დღეს'
    : daysUntilOpening === 1
      ? 'ხვალ'
      : weekdayNames[nextWeekday]

  return {
    isOpen: false,
    label: 'ახლა დაკეტილია',
    detail: `გაიხსნება ${nextDay} ${nextOpening.opens}:00-ზე`,
  }
}

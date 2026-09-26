import type { TicketMilestoneStep } from '../components/TicketMilestones'

type CustomerServiceStepId = 'received' | 'in_service' | 'ready' | 'handed_over'

export type CustomerServiceProgress = {
  known: boolean
  milestones: (TicketMilestoneStep & { id: CustomerServiceStepId })[]
  summary: { title: string; description: string; note?: string }
}

const progressCopy = {
  ka: {
    steps: ['მიღება', 'სერვისი', 'მზადაა', 'ჩაბარება'],
    current: 'მიმდინარე',
    waiting: 'ნაწილის მოლოდინში',
    unsuccessful: 'ვერ შეკეთდა',
    unknown: 'სტატუსი დასაზუსტებელია',
    unknownDescription: 'ამ სტატუსით სერვისის ეტაპი ვერ განისაზღვრება. დეტალებისთვის დაგვიკავშირდით.',
    statuses: {
      new: { title: 'მიღებულია', description: 'მოწყობილობა მიღებულია სერვისში.' },
      in_progress: { title: 'მიმდინარეობს', description: 'მოწყობილობა სერვისშია და სამუშაო მიმდინარეობს.' },
      waiting_for_part: { title: 'ნაწილის მოლოდინში', description: 'მოწყობილობა საჭირო ნაწილის მოლოდინშია.' },
      ready: { title: 'მზად არის', description: 'მოწყობილობა მზად არის გასატანად.' },
      could_not_fix: { title: 'შეკეთება ვერ მოხერხდა', description: 'არსებული ჩანაწერის მიხედვით, მოწყობილობის შეკეთება ვერ მოხერხდა.' },
      picked_up: { title: 'ჩაბარებულია', description: 'მოწყობილობა მომხმარებელს გადაეცა. შესრულებული სამუშაოს შესახებ ინფორმაცია იხილეთ დეტალებში.' },
    },
  },
  en: {
    steps: ['Received', 'In service', 'Ready', 'Collected'],
    current: 'Current',
    waiting: 'Waiting for a part',
    unsuccessful: 'Could not be repaired',
    unknown: 'Status needs clarification',
    unknownDescription: 'The service stage cannot be determined from this status. Please contact us for details.',
    statuses: {
      new: { title: 'Received', description: 'The device has been received at the service centre.' },
      in_progress: { title: 'In progress', description: 'The device is at the service centre and work is in progress.' },
      waiting_for_part: { title: 'Waiting for a part', description: 'The device is waiting for a required part.' },
      ready: { title: 'Ready', description: 'The device is ready to collect.' },
      could_not_fix: { title: 'Could not be repaired', description: 'According to the recorded status, the device could not be repaired.' },
      picked_up: { title: 'Handed over', description: 'The device has been handed over to the customer. See the details for the recorded work outcome.' },
    },
  },
}

const currentStep: Record<string, number> = {
  new: 0,
  in_progress: 1,
  waiting_for_part: 1,
  ready: 2,
  could_not_fix: 1,
  picked_up: 3,
}

const stepIds: CustomerServiceStepId[] = ['received', 'in_service', 'ready', 'handed_over']

/** Backend statuses describe service custody/progress, not a diagnostic timeline.
 * Even picked_up may follow an unsuccessful repair, so no milestone asserts that
 * a diagnosis or repair succeeded. A supplied outcome is displayed, never inferred.
 */
export function getCustomerServiceProgress(status: string, locale: 'ka' | 'en', resolution?: string | null): CustomerServiceProgress {
  const copy = progressCopy[locale]
  const known = Object.hasOwn(currentStep, status)
  const activeIndex = known ? currentStep[status] : -1
  const handedOver = status === 'picked_up'
  const helperText = status === 'waiting_for_part' ? copy.waiting : status === 'could_not_fix' ? copy.unsuccessful : copy.current
  const summary = known
    ? copy.statuses[status as keyof typeof copy.statuses]
    : { title: status.trim() || copy.unknown, description: copy.unknownDescription }
  const note = resolution?.trim()

  return {
    known,
    milestones: stepIds.map((id, index) => ({
      id,
      label: copy.steps[index],
      state: handedOver ? 'complete' : activeIndex < 0 || index > activeIndex ? 'upcoming' : index === activeIndex ? 'current' : 'complete',
      ...(!handedOver && index === activeIndex ? { helperText } : {}),
    })),
    summary: { ...summary, ...(note ? { note } : {}) },
  }
}

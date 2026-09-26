export type AssistantHistoryMessage = {
  role: 'user' | 'assistant'
  content: string
}

export type AssistantAssessment = {
  service: string
  labor_price: string
  estimated_duration: string
  price_note: string
  disclaimer: string
}

export type AssistantResponse = {
  reply: string
  mode: 'knowledge' | 'ollama' | 'openai'
  assessment: AssistantAssessment | null
}

type AskAssistantOptions = {
  message: string
  language?: 'ka' | 'en'
  sessionId: string
  history?: AssistantHistoryMessage[]
  signal?: AbortSignal
}

export class AssistantApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'AssistantApiError'
    this.status = status
  }
}

const apiBase = (import.meta.env.VITE_TECSERVICE_API_BASE ?? '').replace(/\/$/, '')

function isAssistantAssessment(value: unknown): value is AssistantAssessment {
  if (typeof value !== 'object' || value === null) return false

  return (
    'service' in value
    && typeof value.service === 'string'
    && Boolean(value.service.trim())
    && 'labor_price' in value
    && typeof value.labor_price === 'string'
    && Boolean(value.labor_price.trim())
    && 'estimated_duration' in value
    && typeof value.estimated_duration === 'string'
    && Boolean(value.estimated_duration.trim())
    && 'price_note' in value
    && typeof value.price_note === 'string'
    && 'disclaimer' in value
    && typeof value.disclaimer === 'string'
    && Boolean(value.disclaimer.trim())
  )
}

export async function askTecServiceAssistant({
  message,
  language = 'ka',
  sessionId,
  history = [],
  signal,
}: AskAssistantOptions): Promise<AssistantResponse> {
  const response = await fetch(`${apiBase}/api/public/assistant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      language,
      session_id: sessionId,
      history: history.slice(-6).map((item) => ({
        ...item,
        content: item.content.slice(0, 800),
      })),
    }),
    signal,
  })

  if (!response.ok) {
    throw new AssistantApiError('Assistant request failed', response.status)
  }

  const data: unknown = await response.json()
  if (
    typeof data !== 'object'
    || data === null
    || !('reply' in data)
    || typeof data.reply !== 'string'
    || !data.reply.trim()
    || !('mode' in data)
    || !['knowledge', 'ollama', 'openai'].includes(String(data.mode))
  ) {
    throw new AssistantApiError('Assistant returned an invalid response', 502)
  }

  const assessment = 'assessment' in data ? data.assessment : null
  if (assessment !== null && assessment !== undefined && !isAssistantAssessment(assessment)) {
    throw new AssistantApiError('Assistant returned an invalid assessment', 502)
  }

  return {
    reply: data.reply,
    mode: String(data.mode) as AssistantResponse['mode'],
    assessment: assessment ?? null,
  }
}

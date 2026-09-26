import { CustomerApiError } from './customerApi'

export type InvoiceTarget = { kind: 'purchase' | 'service'; id: string | number; reference: string }
export type CustomerInvoice = { id: string; number: string; issued_at: string }
export type ServiceInvoice = CustomerInvoice & {
  document_date: string; currency: 'GEL'
  seller: { name: string; tax_id: string; address: string; phone: string; representative: string }
  buyer: { name: string; phone: string; company_name: string; tax_id: string }
  lines: { description: string; device: string; quantity: number; unit_price: number; amount: number }[]
  total: number; payment_status: 'draft' | 'issued' | 'paid' | 'unconfirmed'; paid_at: string | null
}

const base = (import.meta.env.VITE_TECSERVICE_API_BASE ?? '').replace(/\/$/, '')
function segment(value: string | number) {
  const result = String(value)
  if (!/^[a-zA-Z0-9_-]{1,160}$/.test(result)) throw new CustomerApiError(422)
  return encodeURIComponent(result)
}
function path(target: InvoiceTarget) {
  return `/api/portal/${target.kind === 'purchase' ? 'purchases' : 'tickets'}/${segment(target.id)}/invoices`
}
async function get(pathname: string, signal: AbortSignal, pdf = false) {
  const response = await fetch(`${base}${pathname}`, { credentials: 'include', cache: 'no-store', signal, headers: { Accept: pdf ? 'application/pdf' : 'application/json' } })
  if (!response.ok) throw new CustomerApiError(response.status)
  const type = response.headers.get('content-type') ?? ''
  if (!type.includes(pdf ? 'application/pdf' : 'application/json')) throw new CustomerApiError(502)
  return response
}
function isInvoice(value: unknown): value is CustomerInvoice {
  if (!value || typeof value !== 'object') return false
  const item = value as CustomerInvoice
  return [item.id, item.number, item.issued_at].every(value => typeof value === 'string') && /^[a-zA-Z0-9_-]{1,160}$/.test(item.id)
}
function strings(value: unknown, keys: string[]) {
  return value !== null && typeof value === 'object' && keys.every(key => typeof (value as Record<string, unknown>)[key] === 'string')
}
export function validateServiceInvoice(value: unknown): ServiceInvoice {
  const item = value as ServiceInvoice
  if (!isInvoice(item) || typeof item.document_date !== 'string' || item.currency !== 'GEL'
    || !strings(item.seller, ['name', 'tax_id', 'address', 'phone', 'representative'])
    || !strings(item.buyer, ['name', 'phone', 'company_name', 'tax_id'])
    || !Array.isArray(item.lines) || item.lines.length === 0 || item.lines.length > 200 || item.lines.some(line => !line
      || typeof line.description !== 'string' || typeof line.device !== 'string'
      || !Number.isInteger(line.quantity) || line.quantity < 1
      || ![line.quantity, line.unit_price, line.amount].every(amount => typeof amount === 'number' && Number.isFinite(amount) && amount >= 0))
    || typeof item.total !== 'number' || !Number.isFinite(item.total) || item.total < 0
    || !['draft', 'issued', 'paid', 'unconfirmed'].includes(item.payment_status)
    || !(item.paid_at === null || typeof item.paid_at === 'string')) throw new CustomerApiError(502)
  return item
}
export const customerInvoiceApi = {
  list: async (target: InvoiceTarget, signal: AbortSignal): Promise<CustomerInvoice[]> => {
    const data: unknown = await (await get(path(target), signal)).json()
    if (!Array.isArray(data) || data.length > 200 || !data.every(isInvoice)) throw new CustomerApiError(502)
    return data
  },
  service: async (target: InvoiceTarget, id: string, signal: AbortSignal): Promise<ServiceInvoice> => validateServiceInvoice(await (await get(`${path(target)}/${segment(id)}`, signal)).json()),
  pdf: async (target: InvoiceTarget, id: string, signal: AbortSignal): Promise<Blob> => {
    const response = await get(`${path(target)}/${segment(id)}.pdf`, signal, true)
    if (Number(response.headers.get('content-length')) > 20 * 1024 * 1024) throw new CustomerApiError(502)
    const blob = await response.blob()
    if (blob.size > 20 * 1024 * 1024 || blob.size < 5 || await blob.slice(0, 5).text() !== '%PDF-') throw new CustomerApiError(502)
    return blob
  },
}

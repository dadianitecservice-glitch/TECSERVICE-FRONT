import type { CustomerAddress, CustomerPurchase, CustomerTicket, CustomerUser } from './types'

const apiBase = (import.meta.env.VITE_TECSERVICE_API_BASE ?? '').replace(/\/$/, '')

export type CustomerProfileUpdate = {
  full_name: string
  email?: string | null
  contact_phone?: string | null
  is_georgian_citizen?: boolean | null
  personal_id?: string | null
  current_password: string
}

export class CustomerApiError extends Error {
  constructor(public status: number, public reason = '') { super('Customer request failed') }
}

async function request<T>(path: string, body?: unknown, signal?: AbortSignal, method?: 'DELETE'): Promise<T> {
  const controller = new AbortController()
  const cancel = () => controller.abort()
  signal?.addEventListener('abort', cancel, { once: true })
  if (signal?.aborted) controller.abort()
  const timeout = setTimeout(cancel, 15000)
  try {
    const response = await fetch(`${apiBase}/api${path}`, {
      method: method ?? (body === undefined ? 'GET' : 'POST'),
      credentials: 'include', cache: 'no-store', signal: controller.signal,
      headers: body === undefined ? { Accept: 'application/json' } : { Accept: 'application/json', 'Content-Type': 'application/json' },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    })
    if (!response.ok) {
      const error = await response.json().catch(() => null)
      throw new CustomerApiError(response.status, typeof error?.detail === 'string' ? error.detail : '')
    }
    if (response.status === 204) return undefined as T
    if (!response.headers.get('content-type')?.includes('application/json')) throw new CustomerApiError(502)
    return await response.json() as T
  } finally {
    clearTimeout(timeout)
    signal?.removeEventListener('abort', cancel)
  }
}

const optionalText = (value: unknown) => value == null || typeof value === 'string'
const finiteNumber = (value: unknown) => typeof value === 'number' && Number.isFinite(value)
const optionalAmount = (value: unknown) => value == null || finiteNumber(value)

function validUser(user: CustomerUser): CustomerUser {
  if (!user || typeof user.id !== 'string' || typeof user.full_name !== 'string' || typeof user.role !== 'string' || typeof user.approval_status !== 'string' || typeof user.is_active !== 'boolean' || ![user.email, user.phone, user.contact_phone, user.company_name, user.tax_id].every(optionalText)) throw new CustomerApiError(502)
  if (!optionalText(user.personal_id) || (user.is_georgian_citizen != null && typeof user.is_georgian_citizen !== 'boolean')) throw new CustomerApiError(502)
  return user
}

function validAddress(value: CustomerAddress): CustomerAddress {
  if (!value || ![value.id, value.label, value.city, value.address].every(item => typeof item === 'string')) throw new CustomerApiError(502)
  return value
}

export const customerApi = {
  me: async (signal?: AbortSignal) => validUser(await request<CustomerUser>('/auth/me', undefined, signal)),
  login: async (identifier: string, password: string) => validUser(await request<CustomerUser>('/auth/login', { identifier, password })),
  register: async (payload: { full_name: string; phone: string; email?: string; password: string }) => validUser(await request<CustomerUser>('/auth/register', { ...payload, account_type: 'physical' })),
  logout: () => request<void>('/auth/logout', {}),
  updateProfile: async (payload: CustomerProfileUpdate) => validUser(await request<CustomerUser>('/portal/profile', {
    full_name: payload.full_name,
    ...(payload.email === undefined ? {} : { email: payload.email }),
    ...(payload.contact_phone === undefined ? {} : { contact_phone: payload.contact_phone }),
    ...(payload.is_georgian_citizen === undefined ? {} : { is_georgian_citizen: payload.is_georgian_citizen }),
    ...(payload.personal_id === undefined ? {} : { personal_id: payload.personal_id }),
    current_password: payload.current_password,
  })),
  addresses: async (signal?: AbortSignal) => {
    const data = await request<CustomerAddress[]>('/portal/addresses', undefined, signal)
    if (!Array.isArray(data)) throw new CustomerApiError(502)
    return data.map(validAddress)
  },
  saveAddress: async (value: Omit<CustomerAddress, 'id'>, id?: string) => validAddress(await request<CustomerAddress>(`/portal/addresses${id ? `/${encodeURIComponent(id)}` : ''}`, { label: value.label, city: value.city, address: value.address })),
  deleteAddress: (id: string) => request<void>(`/portal/addresses/${encodeURIComponent(id)}`, undefined, undefined, 'DELETE'),
  changePassword: (current_password: string, new_password: string) => request<void>('/portal/password', { current_password, new_password }),
  tickets: async (signal?: AbortSignal) => {
    const data = await request<CustomerTicket[]>('/portal/tickets', undefined, signal)
    if (!Array.isArray(data) || data.some(item => !item
      || !(item.ticket_code === null || finiteNumber(item.ticket_code))
      || !optionalText(item.device) || !optionalText(item.resolution) || !optionalAmount(item.cost_estimate)
      || ![item.status, item.issue_description, item.created_at, item.updated_at].every(value => typeof value === 'string')
      || !Array.isArray(item.items) || item.items.some(device => !device
        || !finiteNumber(device.position) || !optionalText(device.device) || !optionalText(device.serial_number) || !optionalText(device.resolution) || !optionalAmount(device.cost_estimate)
        || ![device.status, device.issue_description, device.updated_at].every(value => typeof value === 'string')))) throw new CustomerApiError(502)
    return data
  },
  purchases: async (signal?: AbortSignal) => {
    const data = await request<CustomerPurchase[]>('/portal/purchases', undefined, signal)
    if (!Array.isArray(data) || data.some(item => !item
      || ![item.id, item.order_number, item.status, item.payment_status, item.created_at, item.currency].every(value => typeof value === 'string')
      || !finiteNumber(item.total) || !Array.isArray(item.items) || item.items.some(product => !product
        || typeof product.name !== 'string' || !finiteNumber(product.quantity) || !finiteNumber(product.unit_price) || !optionalText(product.image_url)))) throw new CustomerApiError(502)
    return data
  },
}

export function customerErrorMessage(error: unknown, english: boolean): string {
  if (error instanceof CustomerApiError) {
    if (error.status === 401) return english ? 'Your phone/email or password is incorrect, or your session has expired. Please sign in again.' : 'ნომერი/ელფოსტა ან პაროლი არასწორია, ან სესია დასრულდა. სცადეთ ხელახლა შესვლა.'
    if (error.status === 403 && /waiting|pending/i.test(error.reason)) return english ? 'Your registration is awaiting verification by our team. Please contact us if you need help.' : 'თქვენი რეგისტრაცია ჩვენი გუნდის დადასტურებას ელოდება. დახმარებისთვის დაგვიკავშირდით.'
    if (error.status === 403) return english ? 'Access is not available for this account. Please contact our team.' : 'ამ ანგარიშისთვის წვდომა მიუწვდომელია. გთხოვთ, დაგვიკავშირდეთ.'
    if (error.status === 409) return english ? 'Registration could not be completed with these details. Try signing in or contact us.' : 'ამ მონაცემებით რეგისტრაცია ვერ დასრულდა. სცადეთ შესვლა ან დაგვიკავშირდით.'
    if (error.status === 422) return english ? 'Please check your details. Use a valid phone number and a password with at least 8 characters, including letters and numbers.' : 'გადაამოწმეთ მონაცემები. მიუთითეთ სწორი ნომერი და მინიმუმ 8-სიმბოლოიანი პაროლი, ასოებითა და ციფრებით.'
    if (error.status === 429) return english ? 'Too many attempts. Please wait before trying again.' : 'დაფიქსირდა ბევრი მცდელობა. ცოტა ხანში სცადეთ ხელახლა.'
  }
  return english ? 'The account service is temporarily unavailable. Your request was not confirmed. Please try again or contact us.' : 'კაბინეტის სერვისი დროებით მიუწვდომელია. მოთხოვნა არ დადასტურებულა. სცადეთ ხელახლა ან დაგვიკავშირდით.'
}

export type CustomerUser = {
  id: string
  full_name: string
  email?: string | null
  phone?: string | null
  contact_phone?: string | null
  is_georgian_citizen?: boolean | null
  personal_id?: string | null
  role: string
  approval_status: string
  is_active: boolean
  company_name?: string | null
  tax_id?: string | null
}

export type CustomerAddress = { id: string; label: string; city: string; address: string }

export type CustomerTicketItem = {
  position: number
  device?: string | null
  serial_number?: string | null
  issue_description: string
  status: string
  cost_estimate?: number | null
  resolution?: string | null
  updated_at: string
}

export type CustomerTicket = {
  ticket_code: number | null
  device?: string | null
  issue_description: string
  status: string
  cost_estimate?: number | null
  resolution?: string | null
  items: CustomerTicketItem[]
  created_at: string
  updated_at: string
}

export type CustomerPurchase = {
  id: string
  order_number: string
  status: string
  payment_status: string
  created_at: string
  total: number
  currency: string
  items: { name: string; quantity: number; unit_price: number; image_url?: string | null }[]
}

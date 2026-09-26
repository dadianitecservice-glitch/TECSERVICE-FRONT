import type { CustomerPurchase, CustomerTicket, CustomerUser } from './types'

// Synthetic UI fixtures only. The account page must gate this behind an explicit
// development preview; these records are never a fallback for an API failure.
export function getDemoAccount(locale: 'ka' | 'en'): {
  user: CustomerUser
  tickets: CustomerTicket[]
  purchases: CustomerPurchase[]
} {
  const en = locale === 'en'
  return {
    user: {
      id: 'demo-customer-preview',
      full_name: en ? 'Customer' : 'მომხმარებელი',
      email: 'customer@example.invalid',
      phone: '+995555123123',
      contact_phone: null,
      role: 'customer',
      approval_status: 'approved',
      is_active: true,
    },
    tickets: [
      {
        ticket_code: 990001,
        device: 'Lenovo ThinkPad T14',
        issue_description: en ? 'The laptop overheats during use.' : 'ლეპტოპი მუშაობისას ხურდება.',
        status: 'in_progress',
        cost_estimate: 90,
        resolution: null,
        created_at: '2026-09-20T08:00:00Z',
        updated_at: '2026-09-21T10:30:00Z',
        items: [{
          position: 1,
          device: 'laptop',
          issue_description: en ? 'Cooling-system inspection.' : 'გაგრილების სისტემის შემოწმება.',
          status: 'in_progress',
          cost_estimate: 90,
          resolution: null,
          updated_at: '2026-09-21T10:30:00Z',
        }],
      },
      {
        ticket_code: 990002,
        device: 'Sony PlayStation 5',
        issue_description: en ? 'No image on the screen.' : 'ეკრანზე გამოსახულება არ ჩანს.',
        status: 'picked_up',
        cost_estimate: 120,
        resolution: en ? 'HDMI port replaced and image output checked.' : 'HDMI პორტი შეიცვალა და გამოსახულება შემოწმდა.',
        created_at: '2026-09-08T07:00:00Z',
        updated_at: '2026-09-11T11:00:00Z',
        items: [],
      },
    ],
    purchases: [
      {
        id: 'demo-purchase-one',
        order_number: '1001',
        status: 'processing',
        payment_status: 'unpaid',
        created_at: '2026-09-21T08:00:00Z',
        total: 149,
        currency: 'GEL',
        items: [{ name: 'Kingston NV3 · 1 TB', quantity: 1, unit_price: 149, image_url: '/assets/products/kingston-nv3-figma.png' }],
      },
      {
        id: 'demo-purchase-two',
        order_number: '1002',
        status: 'completed',
        payment_status: 'paid',
        created_at: '2026-09-07T09:00:00Z',
        total: 65,
        currency: 'GEL',
        items: [{ name: 'Kingston A400 · 480 GB', quantity: 1, unit_price: 65, image_url: '/assets/products/kingston-a400-480-figma.png' }],
      },
    ],
  }
}

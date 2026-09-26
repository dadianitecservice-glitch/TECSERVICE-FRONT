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
      full_name: en ? 'Demo customer' : 'დემო მომხმარებელი',
      email: 'demo@example.invalid',
      phone: '+995555123123',
      contact_phone: null,
      role: 'customer',
      approval_status: 'approved',
      is_active: true,
    },
    tickets: [
      {
        ticket_code: 990001,
        device: en ? 'Lenovo ThinkPad T14 · demo' : 'Lenovo ThinkPad T14 · დემო',
        issue_description: en ? 'Fictional example: the laptop overheats during use.' : 'გამოგონილი მაგალითი: ლეპტოპი მუშაობისას ხურდება.',
        status: 'in_progress',
        cost_estimate: 90,
        resolution: null,
        created_at: '2026-09-20T08:00:00Z',
        updated_at: '2026-09-21T10:30:00Z',
        items: [{
          position: 1,
          device: 'laptop',
          issue_description: en ? 'Fictional cooling-system inspection.' : 'გაგრილების სისტემის შემოწმების გამოგონილი ჩანაწერი.',
          status: 'in_progress',
          cost_estimate: 90,
          resolution: null,
          updated_at: '2026-09-21T10:30:00Z',
        }],
      },
      {
        ticket_code: 990002,
        device: en ? 'Sony PlayStation 5 · demo' : 'Sony PlayStation 5 · დემო',
        issue_description: en ? 'Fictional example: no image on the screen.' : 'გამოგონილი მაგალითი: ეკრანზე გამოსახულება არ ჩანს.',
        status: 'picked_up',
        cost_estimate: 120,
        resolution: en ? 'Fictional example: HDMI port replaced and image output tested.' : 'გამოგონილი მაგალითი: HDMI პორტი შეიცვალა და გამოსახულება შემოწმდა.',
        created_at: '2026-09-08T07:00:00Z',
        updated_at: '2026-09-11T11:00:00Z',
        items: [],
      },
    ],
    purchases: [
      {
        id: 'demo-purchase-one',
        order_number: 'DEMO-1001',
        status: 'processing',
        payment_status: 'unpaid',
        created_at: '2026-09-21T08:00:00Z',
        total: 149,
        currency: 'GEL',
        items: [{ name: en ? 'Kingston NV3 · 1 TB · demo' : 'Kingston NV3 · 1 TB · დემო', quantity: 1, unit_price: 149, image_url: '/assets/products/kingston-nv3-figma.png' }],
      },
      {
        id: 'demo-purchase-two',
        order_number: 'DEMO-1002',
        status: 'completed',
        payment_status: 'paid',
        created_at: '2026-09-07T09:00:00Z',
        total: 65,
        currency: 'GEL',
        items: [{ name: en ? 'Kingston A400 · 480 GB · demo' : 'Kingston A400 · 480 GB · დემო', quantity: 1, unit_price: 65, image_url: '/assets/products/kingston-a400-480-figma.png' }],
      },
    ],
  }
}

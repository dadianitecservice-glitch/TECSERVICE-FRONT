import type { InvoiceTarget, ServiceInvoice } from './customerInvoiceApi'

// Imported only by the explicitly enabled development preview.
export function demoInvoice(target: InvoiceTarget, locale: 'ka' | 'en'): ServiceInvoice {
  const purchase = target.kind === 'purchase'
  const second = target.id === 'demo-purchase-two' || target.id === 990002
  const amount = purchase ? second ? 65 : 149 : second ? 120 : 90
  return {
    id: 'sample-invoice', number: second ? 'INV-1002' : 'INV-1001', issued_at: '2026-09-25T08:00:00Z', document_date: '2026-09-25', currency: 'GEL',
    seller: { name: locale === 'ka' ? 'გამყიდველი' : 'Seller', tax_id: '', address: '', phone: '', representative: '' },
    buyer: { name: locale === 'ka' ? 'მომხმარებელი' : 'Customer', company_name: '', phone: '', tax_id: '' },
    lines: [{ description: purchase ? second ? 'Kingston A400 · 480 GB' : 'Kingston NV3 · 1 TB' : locale === 'ka' ? 'მომსახურება' : 'Service', device: target.reference, quantity: 1, unit_price: amount, amount }],
    total: amount, payment_status: 'unconfirmed', paid_at: null,
  }
}

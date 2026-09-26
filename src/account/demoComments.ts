import type { CustomerComment } from './customerCommentsApi'

// Imported dynamically only inside the development preview branch.
export function getDemoComments(locale: 'ka' | 'en'): CustomerComment[] {
  return [{
    id: 'demo-comment-preview-only', version: 1,
    product: { id: 'kingston-nv3-1tb', slug: 'kingston-nv3-1tb-pcie-4-nvme', name: 'Kingston NV3 1TB PCIe 4.0 NVMe', image_url: '/assets/products/kingston-nv3-figma.png' },
    text: locale === 'ka' ? 'საცდელი კომენტარი — აქ გამოჩნდება თქვენი აზრი პროდუქტზე.' : 'Sample comment — your feedback about the product will appear here.',
    author_name: locale === 'ka' ? 'დემო' : 'Demo',
    created_at: '2026-09-25T08:00:00Z', updated_at: '2026-09-25T08:00:00Z', product_available: true,
  }]
}

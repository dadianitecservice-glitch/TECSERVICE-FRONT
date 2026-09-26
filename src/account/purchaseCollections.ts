import type { CustomerPurchase } from './types'

export type PurchaseCollection = 'active' | 'completed'

const completedStatuses = new Set(['completed', 'delivered', 'cancelled', 'returned', 'partial_return'])

// Fulfilment state decides the history tab, never the payment state.
// Unknown statuses remain visible among current orders for follow-up.
export function getPurchaseCollection(status: string): PurchaseCollection {
  return completedStatuses.has(status) ? 'completed' : 'active'
}

export function filterCustomerPurchases(purchases: readonly CustomerPurchase[], collection: PurchaseCollection) {
  return purchases.filter(purchase => getPurchaseCollection(purchase.status) === collection)
}

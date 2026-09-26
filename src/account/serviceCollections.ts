import type { CustomerTicket } from './types'

export type ServiceCollection = 'active' | 'collected'

// Ready and unsuccessful repairs still belong to the centre until handed over.
export function getServiceCollection(status: string): ServiceCollection {
  return status === 'picked_up' ? 'collected' : 'active'
}

export function filterCustomerTickets(tickets: readonly CustomerTicket[], collection: ServiceCollection) {
  return tickets.filter(ticket => getServiceCollection(ticket.status) === collection)
}

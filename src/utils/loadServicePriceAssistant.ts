type AssistantModule = typeof import('./servicePriceAssistant.ts')

// Price catalogs are needed only after a visitor requests an assessment, not
// while rendering the homepage. Share one in-flight request and allow retries.
export function createServicePriceAssistantLoader(
  importModule: () => Promise<AssistantModule> = () => import('./servicePriceAssistant.ts'),
) {
  let pending: Promise<AssistantModule> | undefined
  return () => {
    pending ??= importModule().catch(error => {
      pending = undefined
      throw error
    })
    return pending
  }
}

export const loadServicePriceAssistant = createServicePriceAssistantLoader()

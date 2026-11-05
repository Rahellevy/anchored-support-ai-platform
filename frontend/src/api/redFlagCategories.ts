import { mockRedFlagCategories } from '../mocks/redFlagCategories'
import { simulateNetwork } from '../mocks/simulateNetwork'
import type { RedFlagCategory } from '../types/flags'

/** TODO(backend): httpClient.get<RedFlagCategory[]>('/admin/red-flag-categories') */
export async function getRedFlagCategories(): Promise<RedFlagCategory[]> {
  await simulateNetwork()
  return structuredClone(mockRedFlagCategories)
}

/**
 * Save changes and send the category for sponsor approval. Nothing takes effect until approved.
 * TODO(backend): httpClient.put(`/admin/red-flag-categories/${category.code}`, category)
 */
export async function submitCategoryForApproval(category: RedFlagCategory): Promise<void> {
  await simulateNetwork()
  const index = mockRedFlagCategories.findIndex((c) => c.code === category.code)
  if (index >= 0) mockRedFlagCategories[index] = { ...category, approval: 'Pending review' }
}

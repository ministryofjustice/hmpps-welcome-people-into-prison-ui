import type { ValidationError } from '../validationMiddleware'

export default (body: Record<string, string>): ValidationError[] => {
  const { imprisonmentStatus } = body
  return !imprisonmentStatus ? [{ text: 'Select a reason for imprisonment', href: '#imprisonment-status-1' }] : []
}

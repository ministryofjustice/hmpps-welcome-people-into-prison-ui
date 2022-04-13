import type { ValidationError } from '../validationMiddleware'

export default (body: Record<string, string>): ValidationError[] => {
  const { imprisonmentStatus } = body
  return !imprisonmentStatus ? [{ text: 'Select why this person is in prison', href: '#imprisonment-status-0' }] : []
}

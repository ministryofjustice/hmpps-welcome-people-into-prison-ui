import type { ValidationError } from '../validationMiddleware'

export default (body: Record<string, string>): ValidationError[] => {
  const { sex } = body
  return !sex ? [{ text: 'Select a sex', href: '#sex' }] : []
}

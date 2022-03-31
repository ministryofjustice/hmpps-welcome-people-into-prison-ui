import { ValidationError } from '../../../../middleware/validationMiddleware'

export default (body: Record<string, string>): ValidationError[] => {
  const { sex } = body
  return !sex ? [{ text: "Select this person's sex", href: '#sex' }] : []
}

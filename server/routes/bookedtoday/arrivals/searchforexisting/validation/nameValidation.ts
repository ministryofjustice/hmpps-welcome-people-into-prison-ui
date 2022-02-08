import { Validator } from '../../../../../middleware/validationMiddleware'

const NameValidator: Validator = (body: Record<string, string>) => [
  ...(body.firstName ? [] : [{ text: "Enter this person's first name", href: '#first-name' }]),
  ...(body.lastName ? [] : [{ text: "Enter this person's last name", href: '#last-name' }]),
]
export default NameValidator

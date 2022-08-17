import { Validator } from '../../middleware/validationMiddleware'

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/

const FeedbackValidator: Validator = (body: Record<string, string>) => [
  ...(body.feedback ? [] : [{ text: 'Enter your feedback', href: '#feedback' }]),
  ...(body.email && !EMAIL_REGEX.test(body.email)
    ? [{ text: 'Enter an email address in the correct format, like name@example.com', href: '#email' }]
    : []),
]
export default FeedbackValidator

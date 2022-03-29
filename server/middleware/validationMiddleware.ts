import { RequestHandler } from 'express'

export type ValidationError = { text?: string; href: string }
export type Validator = (body: Record<string, string>) => ValidationError[] | Promise<ValidationError[]>

export default (...validators: Validator[]): RequestHandler =>
  async (req, res, next) => {
    const validationResults = await Promise.all(validators.map(validator => validator(req.body)))
    const errors = validationResults.flat()
    if (errors.length) {
      req.errors = errors
      req.flash('errors', errors)
    }
    next()
  }

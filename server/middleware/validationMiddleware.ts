import { RequestHandler } from 'express'
import asyncMiddleware from './asyncMiddleware'

export type ValidationError = { text?: string; href: string }
export type Validator = (body: Record<string, string>) => ValidationError[] | Promise<ValidationError[]>

export default (validator: Validator): RequestHandler =>
  asyncMiddleware(async (req, res, next) => {
    const errors = await validator(req.body)
    if (errors.length) {
      req.errors = errors
      req.flash('errors', errors)
    }
    next()
  })

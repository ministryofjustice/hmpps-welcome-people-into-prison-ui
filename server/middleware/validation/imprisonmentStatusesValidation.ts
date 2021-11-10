import { Request, Response, NextFunction } from 'express'

export default (req: Request, res: Response, next: NextFunction) => {
  const { imprisonmentStatus } = req.body
  const errorData = [{ text: 'Select a reason for imprisonment', href: '#imprisonment-status-1' }]

  if (!imprisonmentStatus) {
    req.errors = errorData
    req.flash('errors', errorData)
  }

  return next()
}

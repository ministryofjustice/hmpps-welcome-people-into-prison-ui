import { Request, Response } from 'express'
import validation from './imprisonmentStatusesValidation'

describe('Validation middleware', () => {
  let req = { body: {}, flash: jest.fn() } as unknown as Request
  const res = {} as Response
  const next = jest.fn()

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should return an error when a imprisonmentStatus is not selected', () => {
    validation(req, res, next)

    expect(req.errors).toEqual([{ text: 'Select a reason for imprisonment', href: '#imprisonment-status-1' }])
    expect(req.flash).toHaveBeenCalledWith('errors', [
      { text: 'Select a reason for imprisonment', href: '#imprisonment-status-1' },
    ])
  })

  it('should not return an error when an imprisonmentStatus is selected ', () => {
    req = { body: { imprisonmentStatus: 'civil-offence' } } as Request
    validation(req, res, next)
    expect(req.errors).toBeUndefined()
  })
})

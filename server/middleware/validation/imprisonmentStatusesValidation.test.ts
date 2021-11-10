import validation from './imprisonmentStatusesValidation'

describe('Imprisonment status validation middleware', () => {
  it('should return an error when a imprisonmentStatus is not selected', () => {
    const result = validation({ imprisonmentStatus: undefined })
    expect(result).toEqual([{ text: 'Select a reason for imprisonment', href: '#imprisonment-status-1' }])
  })

  it('should not return an error when an imprisonmentStatus is selected ', () => {
    const result = validation({ imprisonmentStatus: 'some status' })
    expect(result).toEqual([])
  })
})

import TemporaryAbsencesService from './temporaryAbsencesService'
import { createTemporaryAbsence, withBodyScanStatus } from '../data/__testutils/testObjects'
import { createMockWelcomeClient } from '../data/__testutils/mocks'
import { createMockBodyScanInfoDecorator } from './__testutils/mocks'

const token = 'some token'

describe('Temporary absences service', () => {
  const welcomeClient = createMockWelcomeClient()

  const bodyScanInfoDecorator = createMockBodyScanInfoDecorator()
  let service: TemporaryAbsencesService

  const res = { locals: { user: { activeCaseLoadId: 'MDI' } } }

  beforeEach(() => {
    jest.resetAllMocks()
    service = new TemporaryAbsencesService(welcomeClient, bodyScanInfoDecorator)
    bodyScanInfoDecorator.decorate.mockImplementation((_token, arrivals) =>
      Promise.resolve(arrivals.map(a => ({ ...a, bodyScanStatus: 'OK_TO_SCAN' }))),
    )
  })

  describe('getTemporaryAbsences', () => {
    const ant = createTemporaryAbsence({ lastName: 'Aardvark' })
    const bat = createTemporaryAbsence({ lastName: 'Bat' })
    const cat = createTemporaryAbsence({ lastName: 'Cat' })
    const dog = createTemporaryAbsence({ lastName: 'Dog' })

    beforeEach(() => {
      welcomeClient.getTemporaryAbsences.mockResolvedValue([dog, bat, ant, cat])
    })

    it('Retrieves temporary absences sorted alphabetically by name', async () => {
      const result = await service.getTemporaryAbsences(token, res.locals.user.activeCaseLoadId)

      expect(result).toStrictEqual([
        withBodyScanStatus(ant),
        withBodyScanStatus(bat),
        withBodyScanStatus(cat),
        withBodyScanStatus(dog),
      ])
      expect(welcomeClient.getTemporaryAbsences).toHaveBeenCalledWith(token, {
        agencyId: res.locals.user.activeCaseLoadId,
      })
    })
  })

  describe('getTemporaryAbsence', () => {
    const temporaryAbsence = createTemporaryAbsence()

    beforeEach(() => {
      welcomeClient.getTemporaryAbsence.mockResolvedValue(temporaryAbsence)
    })
    it('Calls upstream service correctly', async () => {
      await service.getTemporaryAbsence(token, 'G0013AB')

      expect(welcomeClient.getTemporaryAbsence).toHaveBeenCalledWith(token, { prisonNumber: 'G0013AB' })
    })

    it('Should return correct data', async () => {
      welcomeClient.getTemporaryAbsence.mockResolvedValue(temporaryAbsence)

      const result = await service.getTemporaryAbsence(token, 'G0013AB')

      expect(result).toStrictEqual(temporaryAbsence)
    })
  })

  describe('confirmTemporaryAbsence', () => {
    it('Calls upstream services correctly', async () => {
      await service.confirmTemporaryAbsence(token, 'G0015GD', 'MDI')

      expect(welcomeClient.confirmTemporaryAbsence).toHaveBeenCalledWith(
        token,
        { prisonNumber: 'G0015GD' },
        { prisonId: 'MDI', arrivalId: undefined },
      )
    })

    it('Calls upstream services correctly when arrivalId present', async () => {
      await service.confirmTemporaryAbsence(token, 'G0015GD', 'MDI', 'abc-123')

      expect(welcomeClient.confirmTemporaryAbsence).toHaveBeenCalledWith(
        token,
        { prisonNumber: 'G0015GD' },
        { prisonId: 'MDI', arrivalId: 'abc-123' },
      )
    })

    it('Should return null', async () => {
      welcomeClient.confirmTemporaryAbsence.mockResolvedValue(null)

      const result = await service.confirmTemporaryAbsence(token, 'G0015GD', 'MDI')
      expect(result).toBe(null)
    })
  })
})

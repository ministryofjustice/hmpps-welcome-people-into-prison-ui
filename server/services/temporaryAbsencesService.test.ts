import { BodyScanStatus } from 'body-scan'
import TemporaryAbsencesService from './temporaryAbsencesService'
import HmppsAuthClient from '../data/hmppsAuthClient'
import WelcomeClient from '../data/welcomeClient'
import { createTemporaryAbsence, withBodyScanInfo } from '../data/__testutils/testObjects'
import { BodyScanInfoDecorator } from './bodyScanInfoDecorator'

jest.mock('./bodyScanInfoDecorator')
jest.mock('../data/hmppsAuthClient')
jest.mock('../data/welcomeClient')

const token = 'some token'

describe('Temporary absences service', () => {
  const welcomeClient = new WelcomeClient(null) as jest.Mocked<WelcomeClient>
  const hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
  const bodyScanInfoDecorator = new BodyScanInfoDecorator(null, null) as jest.Mocked<BodyScanInfoDecorator>
  let service: TemporaryAbsencesService

  const WelcomeClientFactory = jest.fn()

  const res = { locals: { user: { activeCaseLoadId: 'MDI' } } }

  beforeEach(() => {
    jest.resetAllMocks()
    WelcomeClientFactory.mockReturnValue(welcomeClient)
    service = new TemporaryAbsencesService(hmppsAuthClient, WelcomeClientFactory, bodyScanInfoDecorator)
    hmppsAuthClient.getSystemClientToken.mockResolvedValue(token)
    bodyScanInfoDecorator.decorate.mockImplementation(as =>
      Promise.resolve(as.map(a => ({ ...a, bodyScanStatus: BodyScanStatus.OK_TO_SCAN })))
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
      const result = await service.getTemporaryAbsences(res.locals.user.activeCaseLoadId)

      expect(result).toStrictEqual([
        withBodyScanInfo(ant),
        withBodyScanInfo(bat),
        withBodyScanInfo(cat),
        withBodyScanInfo(dog),
      ])
      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
      expect(welcomeClient.getTemporaryAbsences).toBeCalledWith(res.locals.user.activeCaseLoadId)
    })

    it('WelcomeClientFactory is called with a token', async () => {
      await service.getTemporaryAbsences(res.locals.user.activeCaseLoadId)

      expect(WelcomeClientFactory).toBeCalledWith(token)
    })
  })

  describe('getTemporaryAbsence', () => {
    const temporaryAbsence = createTemporaryAbsence()

    beforeEach(() => {
      welcomeClient.getTemporaryAbsence.mockResolvedValue(temporaryAbsence)
    })
    it('Calls upstream service correctly', async () => {
      await service.getTemporaryAbsence('MDI', 'G0013AB')

      expect(WelcomeClientFactory).toBeCalledWith(token)
      expect(welcomeClient.getTemporaryAbsence).toBeCalledWith('MDI', 'G0013AB')
    })

    it('Should return correct data', async () => {
      welcomeClient.getTemporaryAbsence.mockResolvedValue(temporaryAbsence)

      const result = await service.getTemporaryAbsence('MDI', 'G0013AB')

      expect(result).toStrictEqual(temporaryAbsence)
    })
  })

  describe('confirmTemporaryAbsence', () => {
    it('Calls upstream services correctly', async () => {
      await service.confirmTemporaryAbsence('user1', 'G0015GD', 'MDI')

      expect(hmppsAuthClient.getSystemClientToken).toBeCalledWith('user1')
      expect(WelcomeClientFactory).toBeCalledWith(token)
      expect(welcomeClient.confirmTemporaryAbsence).toBeCalledWith('G0015GD', 'MDI')
    })
    it('Should return null', async () => {
      welcomeClient.confirmTemporaryAbsence.mockResolvedValue(null)

      const result = await service.confirmTemporaryAbsence('user1', 'G0015GD', 'MDI')
      expect(result).toBe(null)
    })
  })
})

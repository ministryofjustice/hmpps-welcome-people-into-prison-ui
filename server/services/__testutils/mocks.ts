import {
  ExpectedArrivalsService,
  ImprisonmentStatusesService,
  PrisonService,
  TransfersService,
  BodyScanInfoDecorator,
  TemporaryAbsencesService,
  NotificationService,
  MatchTypeDecorator,
  OffenceInfoDecorator,
} from '..'

jest.mock('..')

export const createMockExpectedArrivalsService = () =>
  new ExpectedArrivalsService(null, null, null, null, null) as jest.Mocked<ExpectedArrivalsService>

export const createMockImprisonmentStatusesService = () =>
  new ImprisonmentStatusesService(null) as jest.Mocked<ImprisonmentStatusesService>

export const createMockPrisonService = () => new PrisonService(null) as jest.Mocked<PrisonService>

export const createMockTransfersService = () => new TransfersService(null, null) as jest.Mocked<TransfersService>

export const createMockBodyScanInfoDecorator = (): jest.Mocked<BodyScanInfoDecorator> => {
  const instance = new BodyScanInfoDecorator(null) as jest.Mocked<BodyScanInfoDecorator>
  instance.decorateSingle = jest.fn()
  instance.decorate = jest.fn()
  return instance
}

export const createMockMatchTypeDecorator = () => new MatchTypeDecorator() as jest.Mocked<MatchTypeDecorator>

export const createMockOffenceInfoDecorator = () => new OffenceInfoDecorator() as jest.Mocked<OffenceInfoDecorator>

export const createMockTemporaryAbsencesService = () =>
  new TemporaryAbsencesService(null, null) as jest.Mocked<TemporaryAbsencesService>

export const createMockNotificationService = () => new NotificationService(null) as jest.Mocked<NotificationService>

import {
  ExpectedArrivalsService,
  ImprisonmentStatusesService,
  PrisonService,
  TransfersService,
  BodyScanInfoDecorator,
  TemporaryAbsencesService,
  UserService,
  NotificationService,
  MatchTypeDecorator,
} from '..'

jest.mock('..')

export const createMockExpectedArrivalsService = () =>
  new ExpectedArrivalsService(null, null, null, null, null) as jest.Mocked<ExpectedArrivalsService>

export const createMockImprisonmentStatusesService = () =>
  new ImprisonmentStatusesService(null, null) as jest.Mocked<ImprisonmentStatusesService>

export const createMockPrisonService = () => new PrisonService(null, null) as jest.Mocked<PrisonService>

export const createMockTransfersService = () => new TransfersService(null, null, null) as jest.Mocked<TransfersService>

export const createMockBodyScanInfoDecorator = () =>
  new BodyScanInfoDecorator(null, null) as jest.Mocked<BodyScanInfoDecorator>

export const createMockMatchTypeDecorator = () => new MatchTypeDecorator() as jest.Mocked<MatchTypeDecorator>

export const createMockTemporaryAbsencesService = () =>
  new TemporaryAbsencesService(null, null, null) as jest.Mocked<TemporaryAbsencesService>

export const createMockUserService = () => new UserService(null, null) as jest.Mocked<UserService>

export const createMockNotificationService = () => new NotificationService(null) as jest.Mocked<NotificationService>

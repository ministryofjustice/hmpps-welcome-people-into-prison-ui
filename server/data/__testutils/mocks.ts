import { WelcomeClient, PrisonRegisterClient, BodyScanClient, LockManager } from '..'

jest.mock('..')

export const createMockWelcomeClient = (): jest.Mocked<WelcomeClient> => {
  return {
    getTransfer: jest.fn(),
    getTransfers: jest.fn(),
    confirmTransfer: jest.fn(),
    getImprisonmentStatuses: jest.fn(),
    getTemporaryAbsences: jest.fn(),
    getTemporaryAbsence: jest.fn(),
    confirmTemporaryAbsence: jest.fn(),
    getExpectedArrivals: jest.fn(),
    getRecentArrivals: jest.fn(),
    getArrival: jest.fn(),
    getPrisonerDetails: jest.fn(),
    confirmExpectedArrival: jest.fn(),
    confirmUnexpectedArrival: jest.fn(),
    confirmCourtReturn: jest.fn(),
    getMatchingRecords: jest.fn(),
    getPrisonerSummaryDetails: jest.fn(),

    get: jest.fn(),
    post: jest.fn(),
  } as unknown as jest.Mocked<WelcomeClient>
}

export const createMockPrisonRegisterClient = () =>
  new PrisonRegisterClient(null, null) as jest.Mocked<PrisonRegisterClient>

export const createMockBodyScanClient = (): jest.Mocked<BodyScanClient> => {
  return {
    getBodyScanInfo: jest.fn(),
    getSingleBodyScanInfo: jest.fn(),
  } as unknown as jest.Mocked<BodyScanClient>
}

export const createLockManager = () => new LockManager(null) as jest.Mocked<LockManager>

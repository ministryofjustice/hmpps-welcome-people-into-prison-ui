import { WelcomeClient, PrisonRegisterClient, HmppsAuthClient, BodyScanClient, LockManager } from '..'

jest.mock('..')

export const createMockWelcomeClient = () => new WelcomeClient(null) as jest.Mocked<WelcomeClient>

export const createMockPrisonRegisterClient = () => new PrisonRegisterClient(null) as jest.Mocked<PrisonRegisterClient>

export const createMockHmppsAuthClient = () => new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>

export const createMockBodyScanClient = () => new BodyScanClient(null) as jest.Mocked<BodyScanClient>

export const createLockManager = () => new LockManager(null) as jest.Mocked<LockManager>

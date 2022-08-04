import { WelcomeClient, HmppsAuthClient, BodyScanClient } from '..'

jest.mock('..')

export const createMockWelcomeClient = () => new WelcomeClient(null) as jest.Mocked<WelcomeClient>

export const createMockHmppsAuthClient = () => new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>

export const createMockBodyScanClient = () => new BodyScanClient(null) as jest.Mocked<BodyScanClient>

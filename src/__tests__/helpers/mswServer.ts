import { setupServer } from 'msw/node'
import { handlers } from './mockNetwork'

export const server = setupServer(...handlers)

import pino from 'pino'

export function createLogger() {
  return pino({
    name: 'worker',
    level: process.env.LOG_LEVEL ?? 'info'
  })
}

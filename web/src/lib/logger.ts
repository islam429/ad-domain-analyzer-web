import pino from 'pino'

const logger = pino({
  name: 'web',
  level: process.env.LOG_LEVEL ?? 'info',
})

export function getLogger() {
  return logger
}

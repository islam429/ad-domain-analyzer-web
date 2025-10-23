import 'dotenv/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Worker, type WorkerOptions } from 'bullmq'
import { createLogger } from './logger.js'

const logger = createLogger()

function buildWorkerOptions(): WorkerOptions {
  const redisUrl = process.env.REDIS_URL
  if (redisUrl) {
    return { connection: { url: redisUrl } }
  }

  return {
    connection: {
      host: process.env.REDIS_HOST ?? '127.0.0.1',
      port: Number.parseInt(process.env.REDIS_PORT ?? '6379', 10)
    }
  }
}

export async function bootstrap() {
  const queueName = process.env.BULLMQ_QUEUE ?? 'jobs'
  const worker = new Worker(
    queueName,
    async job => {
      logger.info({ jobId: job.id, name: job.name }, 'processing job placeholder')
      // Platzhalter: hier später die eigentliche Job-Logik ergänzen.
    },
    buildWorkerOptions()
  )

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err }, 'job failed')
  })

  worker.on('completed', job => {
    logger.info({ jobId: job.id }, 'job completed')
  })

  logger.info({ queueName }, 'worker bootstrapped')
  return worker
}

const isDirectRun =
  typeof process.argv[1] === 'string' &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isDirectRun) {
  bootstrap().catch(err => {
    logger.fatal({ err }, 'worker bootstrap failed')
    process.exit(1)
  })
}

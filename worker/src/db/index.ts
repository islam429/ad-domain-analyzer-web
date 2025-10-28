import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createClient() {
  const url = process.env.DATABASE_URL || ''
  const connectionUrl = url.includes('?')
    ? `${url}&pgbouncer=true&sslmode=require`
    : `${url}?pgbouncer=true&sslmode=require`

  return new PrismaClient({
    datasources: { db: { url: connectionUrl } },
    log: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['query', 'error', 'warn'],
  })
}

export const prisma = globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma

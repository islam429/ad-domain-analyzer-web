// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const g = global as any
export const prisma: PrismaClient = g.prisma || new PrismaClient()
export const db = prisma

if (process.env.NODE_ENV !== 'production') g.prisma = prisma

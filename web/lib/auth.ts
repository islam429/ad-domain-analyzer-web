import type { NextAuthOptions } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: 'email-password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Passwort', type: 'password' },
      },
      authorize: async (creds) => {
        const email = (creds?.email || '').toLowerCase().trim()
        const pwd = creds?.password || ''
        if (!email || !pwd) return null

        const user = await prisma.userAccount.findUnique({ where: { email } })
        if (!user) return null

        const ok = await bcrypt.compare(pwd, user.passwordHash)
        return ok ? { id: user.id, email: user.email, name: user.name || user.email } : null
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  secret: process.env.NEXTAUTH_SECRET,
}

export async function auth() {
  return getServerSession(authOptions)
}

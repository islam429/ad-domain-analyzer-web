import { NextResponse, type NextRequest } from 'next/server'

export const config = {
  matcher: ['/api/:path*'],
}

const ALLOWED_ORIGINS = new Set(['https://admin.pryos.io', 'https://www.pryos.io'])

export function middleware(req: NextRequest) {
  const origin = req.headers.get('origin') || ''
  const isAllowedOrigin = ALLOWED_ORIGINS.has(origin)

  if (req.method === 'OPTIONS') {
    const res = new NextResponse(null, { status: 204 })
    if (isAllowedOrigin) {
      res.headers.set('Access-Control-Allow-Origin', origin)
      res.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
      res.headers.set('Access-Control-Allow-Headers', req.headers.get('access-control-request-headers') || '')
      res.headers.set('Access-Control-Allow-Credentials', 'true')
    }
    return res
  }

  const response = NextResponse.next()
  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }
  return response
}

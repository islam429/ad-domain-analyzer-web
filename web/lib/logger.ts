// web/lib/logger.ts
export function getLogger() {
  return {
    info: (...a: any[]) => console.log('[info ]', ...a),
    warn: (...a: any[]) => console.warn('[warn ]', ...a),
    error: (...a: any[]) => console.error('[error]', ...a),
    debug: (...a: any[]) =>
      process.env.NODE_ENV !== 'production' && console.debug('[debug]', ...a),
  }
}

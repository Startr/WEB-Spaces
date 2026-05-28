import path from 'path'

const BASE = path.resolve('./dist')
const PORT = 8080

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url)
    const pathname = url.pathname === '/' ? '/index.html' : url.pathname
    const filePath = path.resolve(BASE, '.' + pathname)
    if (!filePath.startsWith(BASE)) {
      return new Response('Forbidden', { status: 403 })
    }
    const file = Bun.file(filePath)
    if (await file.exists()) {
      return new Response(file)
    }
    // SPA fallback: unknown paths serve index.html
    return new Response(Bun.file(path.join(BASE, 'index.html')))
  }
})

console.log(`Serving on http://localhost:${PORT}`)

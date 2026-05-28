const BASE = './dist'
const PORT = 8080

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url)
    const pathname = url.pathname === '/' ? '/index.html' : url.pathname
    const filePath = BASE + pathname
    const file = Bun.file(filePath)
    if (await file.exists()) {
      return new Response(file)
    }
    // SPA fallback: unknown paths serve index.html
    return new Response(Bun.file(BASE + '/index.html'))
  }
})

console.log(`Serving on http://localhost:${PORT}`)

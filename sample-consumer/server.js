import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer as createViteServer } from 'vite'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isProduction = process.env.NODE_ENV === 'production'
const port = Number(process.env.PORT) || 5174
const idpApiBaseUrl = (process.env.IDP_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '')

const app = express()
app.use(cors())

app.use((_req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups')
  next()
})

app.use(
  createProxyMiddleware({
    target: idpApiBaseUrl,
    changeOrigin: true,
    pathFilter: '/v1.0',
  }),
)

function onListenError(error) {
  if (error.code === 'EADDRINUSE') {
    console.error(
      `\nPorta ${port} já está em uso. Encerre o processo anterior ou use outra porta:\n` +
        `  $env:PORT=5175; npm run dev\n`,
    )
    process.exit(1)
  }
  throw error
}

function onListening() {
  console.log(`Sample consumer: http://localhost:${port}`)
  console.log(`Proxying /v1.0/* -> ${idpApiBaseUrl}`)
}

if (isProduction) {
  const dist = path.join(__dirname, 'dist')
  app.use(express.static(dist))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(dist, 'index.html'))
  })
  const server = app.listen(port, onListening)
  server.on('error', onListenError)
} else {
  const httpServer = http.createServer(app)
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: { server: httpServer },
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      },
    },
    appType: 'custom',
  })
  app.use(vite.middlewares)
  app.get(/^(?!\/v\d+\.\d+\/).*/, async (req, res, next) => {
    try {
      const url = req.originalUrl
      let template = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8')
      template = await vite.transformIndexHtml(url, template)
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template)
    } catch (error) {
      vite.ssrFixStacktrace?.(error)
      next(error)
    }
  })

  httpServer.on('error', onListenError)
  httpServer.listen(port, onListening)
}

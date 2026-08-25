const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

// Em ambientes de produção da Hostinger, NODE_ENV deve ser 'production'
const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Ocorreu um erro ao processar a requisição:', req.url, err)
      res.statusCode = 500
      res.end('Erro interno do servidor')
    }
  })
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Servidor Next.js rodando em http://${hostname}:${port}`)
    })
})

const http = require('http')

class Context {
  constructor(req, res) {
    this.req = req
    this.res = res

    this.onerror = (err) => {
      console.error(err)
      this.res.statusCode = 500
      this.res.end('Internel Server Error')
    }
  }
}

module.exports = class Application {
  constructor(options) {
    this.middlewares = []
  }

  listen(...args) {
    const server = http.createServer(this.callback())
    server.listen(...args)
  }

  callback() {
    const fn = compose(this.middlewares)

    return (req, res) => {
      const ctx = new Context(req, res)
      return this.handleRequest(ctx, fn)
    }
  }

  handleRequest(ctx, fnMiddleware) {
    const onerror = ctx.onerror
    const handleResponse = () => response(ctx)
    return fnMiddleware(ctx).then(handleResponse).catch(onerror)
  }

  use(middleware) {
    if (typeof middleware !== 'function') {
      throw new TypeError(`Middleware should be a function`)
    }
    this.middlewares.push(middleware)
  }
}

function compose(middlewares) {
  return function (ctx, next) {
    let index = -1
    function dispatch(i) {
      if (i <= index) {
        return Promise.reject(new Error(`next() called multiple times`))
      }
      index = i

      let fn = middlewares[i]
      if (i === middlewares.length) {
        fn = next
      }

      if (!fn) return Promise.resolve()
      try {
        return Promise.resolve(fn(ctx, dispatch.bind(null, i + 1)))
      } catch (err) {
        return Promise.reject(err)
      }
    }

    return dispatch(0)
  }
}

function response(ctx) {
  return ctx.res.end(ctx.body)
}

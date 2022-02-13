const Application = require('../lib/application')

const app = new Application()

app.use(async (ctx, next) => {
  console.log('1')
  ctx.body = 'hello koa'
  await next()
  console.log('3')
})

app.use((ctx, next) => {
  console.log('2')
  ctx.body = ctx.body ? ctx.body + ', ---' : 'new body'
})

app.listen(3002)
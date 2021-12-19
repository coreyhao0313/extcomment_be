const Koa = require('koa');
const cors = require('@koa/cors');
const bodyParser = require('koa-bodyparser');
const logger = require('koa-logger');
const jwtKoa = require('koa-jwt');
const static = require('koa-static');
// const session = require('koa-session');
// const passport = require('koa-passport');

const config = require('./app/config.json');

require('./app/models');
// require('./app/passport');

// app.use(session({}, app));
// app.use(passport.initialize());
// app.use(passport.session({}));

const app = new Koa();

app.keys = ['corey'];
app
  .use(cors({
    credentials: true,
    keepHeadersOnError: true
  }))
  .use(bodyParser())
  .use(jwtKoa({secret: config[process.env.NODE_ENV].auth.jwt.secret})
    .unless({
      path: config[process.env.NODE_ENV].auth.whitelist
        .map((pe)=>new RegExp(pe))
    }))
  .use(logger())
  .use(static('./files'))
  .use(require('./app/routes')
  .routes());


const curConfigEnv = config[process.env.NODE_ENV];

app.listen(curConfigEnv.port, curConfigEnv.host);

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', reason.stack || reason);
  // Recommended: send the information to sentry.io
  // or whatever crash reporting service you use
});

process.on('uncaughtException', function (err) {
  console.error((new Date).toString() + ' uncaughtException:', err.message);
  console.error(err.stack);
  // Send the error log to your email
  process.exit(1);
});
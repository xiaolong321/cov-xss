const path = require('path')
const http = require('http')
const express = require('express')

const bodyParser = require('body-parser')
const session = require('express-session')
const LRU = require("lru-cache")

const app = express()
const AV = require('./config/config').AV
const router = require('./server/routers/router')
const NODE_ENV = process.env.NODE_ENV || 'production'
const isDev = NODE_ENV === 'development'
const SERVER_CONFIG = require('./config/config').SERVER_CONFIG

global.AV = AV
global.LRUCache = LRU({
    max: 500,
    length: function (n, key) { return n.length * 2 + key.length },
    maxAge: 1000 * 60 * 60
})
global.BlackCache = LRU({
    max: 100,
    maxAge: 1000 * 60 * 60
})

app.set('views', path.join(__dirname, 'server/views'))
app.set('view engine', 'ejs')
app.enable('trust proxy')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    limit: '5mb',
    extended: true
}))

app.use(session({
  secret: 'sakjfbasfusfjkasduiasfjknaskfbajnsf89asfasn234hb',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 360000 }
}))

app.use(function(err, req, res, next) {
    console.error(err.stack)
    res.status(500).send({msg: 'Something broke!'})
})

app.all('*',function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');

  if (req.method == 'OPTIONS') {
    res.send(200); /让options请求快速返回/
  }
  else {
    next();
  }
});

app.use(router)

if (isDev) {
    // local variables for all views
    app.locals.env = NODE_ENV;
    app.locals.reload = true;
    
    // static assets served by webpack-dev-middleware & webpack-hot-middleware for development
    const webpack = require('webpack')
    const webpackDevMiddleware = require('webpack-dev-middleware')
    const webpackHotMiddleware = require('webpack-hot-middleware')
    const webpackDevConfig = require('./build/webpack.config.js')

    const compiler = webpack(webpackDevConfig)

    app.use(webpackDevMiddleware(compiler, {
        publicPath: webpackDevConfig.output.publicPath,
        noInfo: true,
        stats: {
            colors: true
        }
    }))

    app.use(webpackHotMiddleware(compiler))

    const server = http.createServer(app)

    app.use(express.static(path.join(__dirname, 'public')))

    server.listen(SERVER_CONFIG.PORT, function(){
        console.log('App (dev) is now running on PORT '+ SERVER_CONFIG.PORT +'!')
    })
} else {
    // static assets served by express.static() for production
    app.use(express.static(path.join(__dirname, 'public')))
    
    app.listen(SERVER_CONFIG.PORT, function () {
        console.log('App (production) is now running on PORT '+ SERVER_CONFIG.PORT +'!')
    })
}

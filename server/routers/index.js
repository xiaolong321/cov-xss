'use strict'
const net = require('net')
const express = require('express')
const router = express.Router()

const signUp = require('./sign').signUp
const signIn = require('./sign').signIn
const logOut = require('./sign').logOut

const isLogin = require('./auth').isLogin
const blackCheck = require('./auth').blackCheck
const crossOrigin = require('./auth').crossOrigin

const getParams = require('./api').getParams
const getByAlias = require('./api').getByAlias
const delAliasCache = require('./api').delAliasCache
const getScreenshot = require('./api').getScreenshot

const removeModule = require('./module').removeModule

// views
router.get('/', isLogin, function (req, res) {
    res.render('index', { title: 'Cov XSS', bundle: 'index' })
})

router.get('/login', function (req, res) {
    console.log(req.socket.remoteAddress)
    console.log(req.socket.remotePort)
    console.log(net.isIP(req.socket.remoteAddress))
    // res.send({ a: 1})
    res.render('login', { title: 'Login - Cov XSS', bundle: 'login' })
})

// login api
router.post('/sign-up', blackCheck, signUp)
router.post('/sign-in', blackCheck, signIn)
router.post('/log-out', isLogin, logOut)

// api
router.all('/code', blackCheck, getByAlias)
router.get('/code/fresh', isLogin, delAliasCache)

// get params
router.all('/api/data', crossOrigin, blackCheck, getParams)

//screenshot
router.post('/api/screenshot', crossOrigin, blackCheck, getScreenshot)

// module
router.get('/dash/api/remove-module', isLogin, removeModule)

module.exports = router
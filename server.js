const express = require('express')
const router = require('./Router/router')
const mongoose = require('mongoose')
const session = require('express-session')
const passport = require('passport')
const cors = require('cors')
const MongoStore = require('connect-mongo')

require('./Utils/passport')(passport)
require('dotenv').config()
const app =express()

const PORT =  process.env.PORT || 5000


mongoose.connect(process.env.LOCAL_CONNECTION_STRING)
.then(()=>{
    console.log("database is connected successfully")
})
.catch((err)=>{
    console.log(err)
})

// body parser
app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use(session({
    secret:'secret',
    resave:false,
    saveUninitialized:false,
    store:MongoStore.create({
        mongoUrl:process.env.LOCAL_CONNECTION_STRING,
        ttl: 14 * 24 * 60 * 60 // session is stored for 14 days
    }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 }  // for 1 day
})
)

// passport
app.use(passport.initialize())
app.use(passport.session())

// cors
app.use(cors({
    origin:'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
    allowedHeaders: ['Content-Type','Origin', 'X-Requested-With', 'Accept', 'x-client-key', 'x-client-token', 'x-client-secret', 'Authorization'],
    credentials:true
}));

app.use(router)

app.listen(PORT,()=>console.log(`server started at http://localhost:${PORT}`))


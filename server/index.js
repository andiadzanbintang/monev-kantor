require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const expressMongoSanitize = require('express-mongo-sanitize')

const app = express()
app.set('trust proxy', 1)

// Mongoose connection
mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("Database Connected"))
.catch((e) => console.log('Database is not connected', e)) 

app.use(express.json())
app.use(expressMongoSanitize())
app.use(cookieParser())
app.use(express.urlencoded({extended:false}))
app.use(helmet())

app.use(cors({
    credentials:true,
    origin: [process.env.FRONTEND_URL]
}))


app.use('/api/v1/admin', require('../server/routes/adminRoutes'))


const PORT = process.env.PORT || 8000
app.listen(PORT, () => console.log(`server is running on port ${PORT}`))
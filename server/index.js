require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const expressMongoSanitize = require('express-mongo-sanitize');
const serverless = require('serverless-http');

const app = express();
app.set('trust proxy', 1);

// Koneksi MongoDB (pastikan tidak reconnect terus-menerus di serverless)
let isConnected = false;
async function connectDB() {
    if (isConnected) {
        console.log('MongoDB sudah terkoneksi!');
        return;
    }
    try {
        await mongoose.connect(process.env.MONGO_URL);
        isConnected = true;
        console.log('Database Connected');
    } catch (e) {
        console.log('Database is not connected', e);
    }
}
connectDB();

app.use(express.json());
app.use(expressMongoSanitize());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());

app.use(
    cors({
        credentials: true,
        origin: [process.env.FRONTEND_URL],
    })
);

// Rute API
app.use('/api/v1/admin', require('../server/routes/adminRoutes'));

module.exports = app;
module.exports.handler = serverless(app);

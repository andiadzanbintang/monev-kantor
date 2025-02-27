const mongoose = require('mongoose')
const {Schema} = mongoose

const logSchema = new Schema({
    name:{
        type:String,
        required:true,
        trim:true,
    },

    username:{
        type:String,
        required:true,
        trim:true,
    },

    activity:{
        type:String,
        required:true,
    },

    logDate:{
        type: Date, required:true,
    },

    logTime:{
        type:Date, required:true
    },

    ipAddress: { type: String, required: true },  // Tambahkan IP
    userAgent: { type: String, required: true }, // Tambahkan User-Agent
    country:{type:String},
    region:{type:String},
    city:{type:String},
    lat:{type:String},
    lon:{type:String},
    timezone:{type:String}

},{timestamps:true})

const LogModel = mongoose.model('log', logSchema)
module.exports = LogModel
const mongoose = require('mongoose')
const {Schema} = mongoose

const missionSchema = new Schema({
    name:{
        type:String,
        required:true,
        index:true,
        unique:true,
    },

    category:{
        type:String,
        required:true,
        default:'Mission'
    }

},{
    timestamps:true
})

const MissionModel = mongoose.model('Mission', missionSchema)
module.exports = MissionModel
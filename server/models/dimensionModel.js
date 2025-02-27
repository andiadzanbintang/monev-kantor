const mongoose = require('mongoose')
const {Schema} = mongoose

const dimensionSchema = new Schema({
    name:{
        type:String,
        required:true,
        index:true,
    },

    category:{
        type:String,
        required:true,
        default:'Dimension'
    },

    kode:{
        type:String,
    }
},{
    timestamps:true
}) 

const DimensionModel = mongoose.model('Dimension', dimensionSchema)
module.exports = DimensionModel
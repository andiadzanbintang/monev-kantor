const mongoose = require('mongoose')
const {Schema} = mongoose

const indicatorSchema = new Schema({
    name:{
        type:String,
        required:true,
        index:true,
    }, 

    category:{
        type:String,
        required:true,
        default:'Indicator'
    },
    
},{
    timestamps:true
})

const IndicatorModel = mongoose.model('Indicator', indicatorSchema)
module.exports = IndicatorModel
const mongoose = require('mongoose')
const {Schema} = mongoose

const policySchema = new Schema({
    name:{
        type:String,
        required:true,
        index:true,
    },

    category:{
        type:String,
        required:true,
        default:'Policy'
    },

    kode:{
        type:String
    }
},{
    timestamps:true,
})

const PolicyModel = mongoose.model('Policy', policySchema)
module.exports = PolicyModel
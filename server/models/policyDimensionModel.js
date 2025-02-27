const mongoose = require('mongoose')
const {Schema} = mongoose

const policyDimensionSchema = new Schema({
    policy: { type: Schema.Types.ObjectId, ref: 'Policy', required: true },
    dimension: { type: Schema.Types.ObjectId, ref: 'Dimension', required: true }
},{
    indexes: [{ policy: 1, dimension: 1, unique: true }],
    timestamps:true,
}); 

const PolicyDimensionModel = mongoose.model('PolicyDimension', policyDimensionSchema);
module.exports = PolicyDimensionModel;

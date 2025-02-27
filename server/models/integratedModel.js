const mongoose = require('mongoose');
const { Schema } = mongoose;

const integratedSchema = new Schema({
    kode:{type:String, required:true, unique:true},
    mission: { type: Schema.Types.ObjectId, ref: 'Mission', required: true },
    policy: { type: Schema.Types.ObjectId, ref: 'Policy', required: true },
    dimension: { type: Schema.Types.ObjectId, ref: 'Dimension', required: true },
    indicator: { type: Schema.Types.ObjectId, ref: 'Indicator', required: true }
},{
    timestamps:true,
});

const IntegratedModel = mongoose.model('Integrated', integratedSchema);
module.exports = IntegratedModel;

const mongoose = require('mongoose');
const { Schema } = mongoose;

const tableVersionSchema = new Schema({
    version: { type: Number, required: true }, // Bisa pakai auto-increment kalau perlu
    createdAt: { type: Date, default: Date.now },
    data: [{
        kode: { type: String, required: true },
        mission: { type: Schema.Types.ObjectId, ref: 'Mission', required: true },
        policy: { type: Schema.Types.ObjectId, ref: 'Policy', required: true },
        dimension: { type: Schema.Types.ObjectId, ref: 'Dimension', required: true },
        indicator: { type: Schema.Types.ObjectId, ref: 'Indicator', required: true }
    }]
},{
    timestamps:true
});

const TableVersion = mongoose.model('TableVersion', tableVersionSchema);
module.exports = TableVersion;

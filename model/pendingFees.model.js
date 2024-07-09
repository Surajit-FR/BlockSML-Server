const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PendingFeesSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'user' },
    charge_id: { type: String, required: true },
    customer_id: { type: String, required: true },
    amount: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('pending_fees', PendingFeesSchema);

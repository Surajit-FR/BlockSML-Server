const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RefundSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    refundId: { type: String, default: "" },
    amount: { type: Number, default: 0 },
    status: { type: String, default: "" },
    created: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('refund', RefundSchema);

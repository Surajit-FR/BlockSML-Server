const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CardDetailSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'user' },
    customer_id: { type: String, required: true },
    card_id: { type: String, required: false },
    name: { type: String, required: false },
    card_no: { type: String, required: false },
    brand: { type: String, required: false },
    month: { type: String, required: false },
    year: { type: Number, required: false },
}, { timestamps: true });

module.exports = mongoose.model('card_detail', CardDetailSchema);

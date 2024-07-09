const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    is_subscribed: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('user', UserSchema);

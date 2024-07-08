const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoleSchema = new Schema({
    name: { type: String, required: true },
    permissions: [{ type: Schema.Types.ObjectId, ref: 'permission' }],
}, { timestamps: true });

module.exports = mongoose.model('role', RoleSchema);

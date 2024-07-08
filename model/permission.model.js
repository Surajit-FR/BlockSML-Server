// permission.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PermissionSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: false },
}, { timestamps: true });

module.exports = mongoose.model('permission', PermissionSchema);
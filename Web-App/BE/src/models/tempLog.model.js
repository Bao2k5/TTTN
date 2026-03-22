// src/models/tempLog.model.js
const mongoose = require('mongoose');

const tempLogSchema = new mongoose.Schema({
    temperature: {
        type: Number,
        required: true
    },
    humidity: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('TempLog', tempLogSchema);

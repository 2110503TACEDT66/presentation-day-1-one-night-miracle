const mongoose = require('mongoose');

const ProviderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true,'Please add name']
    },
    address: {
        type: String,
        required: [true,'Please add a pricerate']
    },
    telephoneNumber: {
        type: String,
        required: [true, 'Please add a telephone number'],
        unique: true,
        match: [/^\d{3}-\d{3}-\d{4}$/, 'Please add a valid 10-digit telephone number']
    }
});

module.exports=mongoose.model('Provider',ProviderSchema);
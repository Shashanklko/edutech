const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
    _id: { 
        type: String, 
        required: true, 
        uppercase: true, 
        trim: true 
    }, // Custom ID: 'SCH001', 'SCH002', 'UNIV001'
    name: { 
        type: String, 
        required: true, 
        trim: true 
    },
    state: {
        type: String,
        required: true,
        trim: true,
        default: 'Delhi'
    },
    region: { 
        type: String, 
        required: true, 
        trim: true 
    },
    boardCode: {
        type: String,
        default: 'CBSE' // 'CBSE', 'UP-BOARD', 'CISCE', 'UGC', 'AICTE'
    },
    establishedYear: { 
        type: Number, 
        default: null 
    },
    affiliation: { 
        type: String, 
        default: null 
    },
    address: { 
        type: String, 
        default: null 
    },
    email: { 
        type: String, 
        default: null 
    },
    phone: { 
        type: String, 
        default: null 
    },
    principalName: { 
        type: String, 
        default: null 
    },
    website: { 
        type: String, 
        default: null 
    },
    institutionType: {
        type: String,
        enum: ['school', 'college', 'university'],
        default: 'school'
    }
}, { 
    timestamps: true 
});

// Virtual getter for id alias
schoolSchema.virtual('id').get(function() {
    return this._id;
});
schoolSchema.set('toJSON', { virtuals: true });
schoolSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('School', schoolSchema);

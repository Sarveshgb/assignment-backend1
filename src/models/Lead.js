import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        trim: true
    },
    event_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    },
    status: {
        type: String,
        enum: ['New', 'Contacted', 'Quote Sent', 'Interested', 'Closed Won', 'Closed Lost'],
        default: 'New'
    }
}, {
    timestamps: true
});

// Index for faster queries
leadSchema.index({ status: 1 });
leadSchema.index({ event_id: 1 });
leadSchema.index({ createdAt: -1 });

const Lead = mongoose.model('Lead', leadSchema);

export default Lead;

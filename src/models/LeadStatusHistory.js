import mongoose from 'mongoose';

const leadStatusHistorySchema = new mongoose.Schema({
    lead_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead',
        required: true
    },
    from_status: {
        type: String,
        enum: ['New', 'Contacted', 'Quote Sent', 'Interested', 'Closed Won', 'Closed Lost', null]
    },
    to_status: {
        type: String,
        required: true,
        enum: ['New', 'Contacted', 'Quote Sent', 'Interested', 'Closed Won', 'Closed Lost']
    },
    notes: {
        type: String,
        trim: true
    },
    changed_at: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: false
});

// Index for faster queries
leadStatusHistorySchema.index({ lead_id: 1, changed_at: -1 });

const LeadStatusHistory = mongoose.model('LeadStatusHistory', leadStatusHistorySchema);

export default LeadStatusHistory;

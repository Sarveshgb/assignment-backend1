import mongoose from 'mongoose';

const quoteSchema = new mongoose.Schema({
    lead_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead',
        required: true
    },
    package_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package',
        required: true
    },
    travelers: {
        type: Number,
        required: true,
        min: 1
    },
    travel_date: {
        type: Date,
        required: true
    },
    base_price: {
        type: Number,
        required: true
    },
    seasonal_multiplier: {
        type: Number,
        default: 0
    },
    early_bird_discount: {
        type: Number,
        default: 0
    },
    last_minute_surcharge: {
        type: Number,
        default: 0
    },
    group_discount: {
        type: Number,
        default: 0
    },
    weekend_surcharge: {
        type: Number,
        default: 0
    },
    final_price: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

// Index for faster queries
quoteSchema.index({ lead_id: 1 });
quoteSchema.index({ package_id: 1 });

const Quote = mongoose.model('Quote', quoteSchema);

export default Quote;

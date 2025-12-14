import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    event_date: {
        type: Date,
        required: true
    },
    category: {
        type: String,
        trim: true
    },
    image_url: {
        type: String,
        trim: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for package count
eventSchema.virtual('packages', {
    ref: 'Package',
    localField: '_id',
    foreignField: 'event_id'
});

const Event = mongoose.model('Event', eventSchema);

export default Event;

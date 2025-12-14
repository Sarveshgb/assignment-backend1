import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
    event_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    base_price: {
        type: Number,
        required: true,
        min: 0
    },
    duration_days: {
        type: Number,
        required: true,
        min: 1
    },
    inclusions: [{
        type: String
    }],
    max_travelers: {
        type: Number,
        min: 1
    },
    image_url: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

const Package = mongoose.model('Package', packageSchema);

export default Package;

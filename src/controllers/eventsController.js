import Event from '../models/Event.js';
import Package from '../models/Package.js';

// Get all events
export const getEvents = async (req, res) => {
    try {
        const events = await Event.find().sort({ event_date: 1 }).lean();

        // Get package count for each event
        const eventsWithPackageCount = await Promise.all(
            events.map(async (event) => {
                const packageCount = await Package.countDocuments({ event_id: event._id });
                return {
                    ...event,
                    id: event._id,
                    package_count: packageCount
                };
            })
        );

        res.json({
            success: true,
            data: eventsWithPackageCount
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch events',
            error: error.message
        });
    }
};

// Get single event by ID
export const getEventById = async (req, res) => {
    const { id } = req.params;

    try {
        const event = await Event.findById(id).lean();

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.json({
            success: true,
            data: { ...event, id: event._id }
        });
    } catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch event',
            error: error.message
        });
    }
};

// Get packages for a specific event
export const getEventPackages = async (req, res) => {
    const { id } = req.params;

    try {
        const event = await Event.findById(id).lean();

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        const packages = await Package.find({ event_id: id })
            .sort({ base_price: 1 })
            .lean();

        res.json({
            success: true,
            data: {
                event: { ...event, id: event._id },
                packages: packages.map(pkg => ({ ...pkg, id: pkg._id }))
            }
        });
    } catch (error) {
        console.error('Error fetching event packages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch event packages',
            error: error.message
        });
    }
};

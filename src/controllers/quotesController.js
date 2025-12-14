import Quote from '../models/Quote.js';
import Lead from '../models/Lead.js';
import Package from '../models/Package.js';
import Event from '../models/Event.js';
import LeadStatusHistory from '../models/LeadStatusHistory.js';
import { calculateQuotePrice } from '../utils/pricing.js';

// Generate a new quote
export const generateQuote = async (req, res) => {
    const { lead_id, package_id, travelers, travel_date } = req.body;

    try {
        // Get lead
        const lead = await Lead.findById(lead_id);

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: 'Lead not found'
            });
        }

        // Get package with event details
        const packageData = await Package.findById(package_id).populate('event_id').lean();

        if (!packageData) {
            return res.status(404).json({
                success: false,
                message: 'Package not found'
            });
        }

        // Calculate pricing
        const travelDateObj = new Date(travel_date);
        const eventDateObj = new Date(packageData.event_id.event_date);

        const pricing = calculateQuotePrice({
            basePrice: packageData.base_price,
            eventDate: eventDateObj,
            travelDate: travelDateObj,
            travelers: parseInt(travelers)
        });

        // Insert quote
        const quote = await Quote.create({
            lead_id,
            package_id,
            travelers,
            travel_date,
            base_price: pricing.basePrice,
            seasonal_multiplier: pricing.multipliers.seasonal_multiplier,
            early_bird_discount: pricing.multipliers.early_bird_discount,
            last_minute_surcharge: pricing.multipliers.last_minute_surcharge,
            group_discount: pricing.multipliers.group_discount,
            weekend_surcharge: pricing.multipliers.weekend_surcharge,
            final_price: pricing.finalPrice
        });

        // Update lead status to "Quote Sent" if not already
        if (lead.status !== 'Quote Sent' && lead.status !== 'Interested' && lead.status !== 'Closed Won') {
            const oldStatus = lead.status;
            lead.status = 'Quote Sent';
            await lead.save();

            // Record status change
            await LeadStatusHistory.create({
                lead_id,
                from_status: oldStatus,
                to_status: 'Quote Sent',
                notes: 'Quote generated automatically'
            });
        }

        res.status(201).json({
            success: true,
            data: {
                quote_id: quote._id,
                lead_id: lead._id,
                package: {
                    id: packageData._id,
                    name: packageData.name,
                    event: packageData.event_id.name
                },
                travelers,
                travel_date,
                pricing: {
                    base_price: pricing.basePrice,
                    adjustments: pricing.adjustments,
                    final_price: pricing.finalPrice
                },
                lead_status: 'Quote Sent'
            },
            message: 'Quote generated successfully'
        });
    } catch (error) {
        console.error('Error generating quote:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate quote',
            error: error.message
        });
    }
};

// Get all quotes
export const getQuotes = async (req, res) => {
    try {
        const quotes = await Quote.find()
            .populate('lead_id', 'name email')
            .populate({
                path: 'package_id',
                select: 'name event_id',
                populate: {
                    path: 'event_id',
                    select: 'name'
                }
            })
            .sort({ createdAt: -1 })
            .lean();

        const formattedQuotes = quotes.map(quote => ({
            ...quote,
            id: quote._id,
            lead_name: quote.lead_id?.name,
            lead_email: quote.lead_id?.email,
            package_name: quote.package_id?.name,
            event_name: quote.package_id?.event_id?.name
        }));

        res.json({
            success: true,
            data: formattedQuotes
        });
    } catch (error) {
        console.error('Error fetching quotes:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch quotes',
            error: error.message
        });
    }
};

// Get quote by ID
export const getQuoteById = async (req, res) => {
    const { id } = req.params;

    try {
        const quote = await Quote.findById(id)
            .populate('lead_id', 'name email phone')
            .populate({
                path: 'package_id',
                select: 'name description event_id',
                populate: {
                    path: 'event_id',
                    select: 'name location event_date'
                }
            })
            .lean();

        if (!quote) {
            return res.status(404).json({
                success: false,
                message: 'Quote not found'
            });
        }

        const formattedQuote = {
            ...quote,
            id: quote._id,
            lead_name: quote.lead_id?.name,
            lead_email: quote.lead_id?.email,
            lead_phone: quote.lead_id?.phone,
            package_name: quote.package_id?.name,
            package_description: quote.package_id?.description,
            event_name: quote.package_id?.event_id?.name,
            event_location: quote.package_id?.event_id?.location,
            event_date: quote.package_id?.event_id?.event_date
        };

        res.json({
            success: true,
            data: formattedQuote
        });
    } catch (error) {
        console.error('Error fetching quote:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch quote',
            error: error.message
        });
    }
};

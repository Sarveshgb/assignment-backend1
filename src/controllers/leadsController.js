import Lead from '../models/Lead.js';
import LeadStatusHistory from '../models/LeadStatusHistory.js';
import Quote from '../models/Quote.js';
import Event from '../models/Event.js';
import { isValidStatusTransition } from '../utils/pricing.js';

// Create a new lead
export const createLead = async (req, res) => {
    const { name, email, phone, message, event_id } = req.body;

    try {
        const lead = await Lead.create({
            name,
            email,
            phone,
            message,
            event_id: event_id || null,
            status: 'New'
        });

        // Create initial status history
        await LeadStatusHistory.create({
            lead_id: lead._id,
            from_status: null,
            to_status: 'New',
            notes: 'Lead created'
        });

        res.status(201).json({
            success: true,
            data: lead,
            message: 'Lead created successfully'
        });
    } catch (error) {
        console.error('Error creating lead:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create lead',
            error: error.message
        });
    }
};

// Get all leads with pagination and filters
export const getLeads = async (req, res) => {
    const { page = 1, limit = 10, status, event_id, month } = req.query;
    const skip = (page - 1) * limit;

    try {
        const query = {};

        if (status) {
            query.status = status;
        }

        if (event_id) {
            query.event_id = event_id;
        }

        if (month) {
            const year = new Date().getFullYear();
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59);
            query.createdAt = { $gte: startDate, $lte: endDate };
        }

        const total = await Lead.countDocuments(query);
        const leads = await Lead.find(query)
            .populate('event_id', 'name event_date location')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        // Get status change count for each lead
        const leadsWithHistory = await Promise.all(
            leads.map(async (lead) => {
                const statusChanges = await LeadStatusHistory.countDocuments({ lead_id: lead._id });
                return {
                    ...lead,
                    event_name: lead.event_id?.name,
                    event_date: lead.event_id?.event_date,
                    status_changes: statusChanges
                };
            })
        );

        res.json({
            success: true,
            data: leadsWithHistory,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching leads:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch leads',
            error: error.message
        });
    }
};

// Get single lead by ID
export const getLeadById = async (req, res) => {
    const { id } = req.params;

    try {
        const lead = await Lead.findById(id)
            .populate('event_id', 'name event_date location')
            .lean();

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: 'Lead not found'
            });
        }

        // Get status history
        const history = await LeadStatusHistory.find({ lead_id: id })
            .sort({ changed_at: -1 })
            .lean();

        // Get quotes
        const quotes = await Quote.find({ lead_id: id })
            .populate('package_id', 'name')
            .sort({ createdAt: -1 })
            .lean();

        res.json({
            success: true,
            data: {
                ...lead,
                event_name: lead.event_id?.name,
                event_date: lead.event_id?.event_date,
                event_location: lead.event_id?.location,
                status_history: history,
                quotes: quotes.map(q => ({
                    ...q,
                    package_name: q.package_id?.name
                }))
            }
        });
    } catch (error) {
        console.error('Error fetching lead:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch lead',
            error: error.message
        });
    }
};

// Update lead status
export const updateLeadStatus = async (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body;

    try {
        const currentLead = await Lead.findById(id);

        if (!currentLead) {
            return res.status(404).json({
                success: false,
                message: 'Lead not found'
            });
        }

        const fromStatus = currentLead.status;

        // Validate status transition
        if (!isValidStatusTransition(fromStatus, status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status transition from '${fromStatus}' to '${status}'`,
                validTransitions: getValidTransitions(fromStatus)
            });
        }

        // Update lead status
        currentLead.status = status;
        await currentLead.save();

        // Record status history
        await LeadStatusHistory.create({
            lead_id: id,
            from_status: fromStatus,
            to_status: status,
            notes: notes || null
        });

        res.json({
            success: true,
            data: currentLead,
            message: `Lead status updated from '${fromStatus}' to '${status}'`
        });
    } catch (error) {
        console.error('Error updating lead status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update lead status',
            error: error.message
        });
    }
};

// Helper function to get valid transitions
const getValidTransitions = (fromStatus) => {
    const transitions = {
        'New': ['Contacted'],
        'Contacted': ['Quote Sent', 'Closed Lost'],
        'Quote Sent': ['Interested', 'Closed Lost'],
        'Interested': ['Closed Won', 'Closed Lost'],
        'Closed Won': [],
        'Closed Lost': []
    };
    return transitions[fromStatus] || [];
};

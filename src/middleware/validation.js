import Joi from 'joi';

// Lead validation schemas
export const createLeadSchema = Joi.object({
    name: Joi.string().min(2).max(255).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^[0-9]{10,15}$/).required(),
    message: Joi.string().max(1000).optional(),
    event_id: Joi.number().integer().positive().optional()
});

export const updateLeadStatusSchema = Joi.object({
    status: Joi.string().valid('New', 'Contacted', 'Quote Sent', 'Interested', 'Closed Won', 'Closed Lost').required(),
    notes: Joi.string().max(500).optional()
});

// Quote generation schema
export const generateQuoteSchema = Joi.object({
    lead_id: Joi.number().integer().positive().required(),
    package_id: Joi.number().integer().positive().required(),
    travelers: Joi.number().integer().min(1).max(50).required(),
    travel_date: Joi.date().iso().required()
});

// Query validation schemas
export const paginationSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    status: Joi.string().valid('New', 'Contacted', 'Quote Sent', 'Interested', 'Closed Won', 'Closed Lost').optional(),
    event_id: Joi.number().integer().positive().optional(),
    month: Joi.number().integer().min(1).max(12).optional()
});

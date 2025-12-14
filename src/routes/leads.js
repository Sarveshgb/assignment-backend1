import express from 'express';
import { createLead, getLeads, getLeadById, updateLeadStatus } from '../controllers/leadsController.js';
import { createLeadSchema, updateLeadStatusSchema, paginationSchema } from '../middleware/validation.js';

const router = express.Router();

// Validation middleware
const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.details.map(d => d.message)
            });
        }
        req.body = value;
        next();
    };
};

const validateQuery = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.query);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.details.map(d => d.message)
            });
        }
        req.query = value;
        next();
    };
};

// Routes
router.post('/', validate(createLeadSchema), createLead);
router.get('/', validateQuery(paginationSchema), getLeads);
router.get('/:id', getLeadById);
router.patch('/:id/status', validate(updateLeadStatusSchema), updateLeadStatus);

export default router;

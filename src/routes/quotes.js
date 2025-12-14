import express from 'express';
import { generateQuote, getQuotes, getQuoteById } from '../controllers/quotesController.js';
import { generateQuoteSchema } from '../middleware/validation.js';

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

router.post('/generate', validate(generateQuoteSchema), generateQuote);
router.get('/', getQuotes);
router.get('/:id', getQuoteById);

export default router;

import express from 'express';
import { getEvents, getEventById, getEventPackages } from '../controllers/eventsController.js';

const router = express.Router();

router.get('/', getEvents);
router.get('/:id', getEventById);
router.get('/:id/packages', getEventPackages);

export default router;
